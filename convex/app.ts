import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const FREE_LIMITS = { plans: 2, swaps: 3, ai: 1 } as const;
const ACTIVE_SUBSCRIPTION_STATES = new Set([
  "active",
  "trialing",
  "past_due",
  "billing_retry",
  "grace_period",
]);

function weekKey(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function requireUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Authentication required");
  return userId;
}

async function subscriptionForUser(ctx: any, userId: any) {
  return await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();
}

function isPro(subscription: any) {
  return Boolean(subscription && ACTIVE_SUBSCRIPTION_STATES.has(subscription.status));
}

function normalizeReferralCode(value: string) {
  const code = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return code.length >= 2 ? code : "";
}

function referralFields(referral: any, now: number, existingCode?: string) {
  const referralCode = normalizeReferralCode(referral?.code || "");
  if (!referralCode || existingCode) return {};
  const fields: any = {
    referralCode,
    referralSourceParam: String(referral?.sourceParam || "via").slice(0, 24),
    referralLandingPath: String(referral?.landingPath || "").slice(0, 240),
    referralCapturedAt: Number(referral?.capturedAt) || now,
    referralProvider: String(referral?.provider || "direct").slice(0, 40),
  };
  const clickId = String(referral?.clickId || "").slice(0, 120);
  const campaign = String(referral?.campaign || "").slice(0, 120);
  if (clickId) fields.referralClickId = clickId;
  if (campaign) fields.referralCampaign = campaign;
  return fields;
}

const referralArg = v.object({
  code: v.string(),
  sourceParam: v.optional(v.string()),
  landingPath: v.optional(v.string()),
  capturedAt: v.optional(v.number()),
  provider: v.optional(v.string()),
  clickId: v.optional(v.string()),
  campaign: v.optional(v.string()),
});

export const bootstrap = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    const preferences = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(8);
    const period = weekKey();
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user_period", (q) => q.eq("userId", userId).eq("period", period))
      .unique();
    const subscription = await subscriptionForUser(ctx, userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const pro = isPro(subscription);
    const counts = usage || { plans: 0, swaps: 0, ai: 0 };

    return {
      user: { id: userId, email: user?.email || "" },
      profile,
      preferences,
      plans,
      subscription,
      isPro: pro,
      usage: {
        period,
        plans: counts.plans,
        swaps: counts.swaps,
        ai: counts.ai,
        remaining: {
          plans: pro ? null : Math.max(0, FREE_LIMITS.plans - counts.plans),
          swaps: pro ? null : Math.max(0, FREE_LIMITS.swaps - counts.swaps),
          ai: pro ? null : Math.max(0, FREE_LIMITS.ai - counts.ai),
        },
      },
    };
  },
});

export const savePreferences = mutation({
  args: {
    budget: v.number(),
    zip: v.string(),
    people: v.number(),
    preference: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (args.budget < 35 || args.budget > 350) throw new Error("Invalid budget");
    if (!/^\d{5}$/.test(args.zip)) throw new Error("Invalid ZIP code");
    if (args.people < 1 || args.people > 8) throw new Error("Invalid household size");
    const existing = await ctx.db
      .query("preferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const value = { ...args, userId, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("preferences", value);
  },
});

export const savePlan = mutation({
  args: { plan: v.any(), preferences: v.any() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!Array.isArray(args.plan) || args.plan.length !== 3) throw new Error("Invalid meal plan");
    const subscription = await subscriptionForUser(ctx, userId);
    const maxPlans = isPro(subscription) ? 8 : 1;
    const now = Date.now();
    await ctx.db.insert("mealPlans", {
      userId,
      plan: args.plan,
      preferences: args.preferences,
      createdAt: now,
      updatedAt: now,
    });
    const plans = await ctx.db
      .query("mealPlans")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    await Promise.all(plans.slice(maxPlans).map((plan) => ctx.db.delete(plan._id)));
  },
});

export const consumeFeature = mutation({
  args: { feature: v.union(v.literal("plans"), v.literal("swaps"), v.literal("ai")) },
  handler: async (ctx, { feature }) => {
    const userId = await requireUserId(ctx);
    const subscription = await subscriptionForUser(ctx, userId);
    if (isPro(subscription)) return { allowed: true, isPro: true, remaining: null };

    const period = weekKey();
    const existing = await ctx.db
      .query("usage")
      .withIndex("by_user_period", (q) => q.eq("userId", userId).eq("period", period))
      .unique();
    const used = existing?.[feature] || 0;
    const limit = FREE_LIMITS[feature];
    if (used >= limit) return { allowed: false, isPro: false, remaining: 0 };

    const next = used + 1;
    if (existing) {
      await ctx.db.patch(existing._id, { [feature]: next, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("usage", {
        userId,
        period,
        plans: feature === "plans" ? 1 : 0,
        swaps: feature === "swaps" ? 1 : 0,
        ai: feature === "ai" ? 1 : 0,
        updatedAt: Date.now(),
      });
    }
    return { allowed: true, isPro: false, remaining: Math.max(0, limit - next) };
  },
});

export const setStripeCustomer = mutation({
  args: {
    stripeCustomerId: v.string(),
    referral: v.optional(referralArg),
  },
  handler: async (ctx, { stripeCustomerId, referral }) => {
    const userId = await requireUserId(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    const fields = referralFields(referral, now, profile?.referralCode);
    if (profile) {
      await ctx.db.patch(profile._id, { stripeCustomerId, ...fields, updatedAt: now });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        stripeCustomerId,
        ...fields,
        createdAt: now,
        updatedAt: now,
      });
    }
    return { userId };
  },
});

export const claimReferral = mutation({
  args: referralArg,
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const code = normalizeReferralCode(args.code);
    if (!code) throw new Error("Invalid referral code");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.referralCode) return { claimed: false, referralCode: profile.referralCode };

    const now = Date.now();
    const value = {
      userId,
      referralCode: code,
      referralSourceParam: String(args.sourceParam || "via").slice(0, 24),
      referralLandingPath: String(args.landingPath || "").slice(0, 240),
      referralCapturedAt: Number(args.capturedAt) || now,
      referralProvider: String(args.provider || "direct").slice(0, 40),
      updatedAt: now,
    };
    const clickId = String(args.clickId || "").slice(0, 120);
    const campaign = String(args.campaign || "").slice(0, 120);
    if (clickId) (value as any).referralClickId = clickId;
    if (campaign) (value as any).referralCampaign = campaign;
    if (profile) await ctx.db.patch(profile._id, value);
    else await ctx.db.insert("profiles", { ...value, createdAt: now });
    return { claimed: true, referralCode: code };
  },
});

export const ensureNativeBillingContext = mutation({
  args: {
    appAccountToken: v.string(),
    revenueCatAppUserId: v.optional(v.string()),
    referral: v.optional(referralArg),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(args.appAccountToken)) {
      throw new Error("Invalid app account token");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();
    const fields = {
      appAccountToken: profile?.appAccountToken || args.appAccountToken,
      ...(args.revenueCatAppUserId ? { revenueCatAppUserId: String(args.revenueCatAppUserId).slice(0, 120) } : {}),
      ...referralFields(args.referral, now, profile?.referralCode),
      updatedAt: now,
    };
    if (profile) await ctx.db.patch(profile._id, fields);
    else await ctx.db.insert("profiles", { userId, ...fields, createdAt: now });
    return {
      userId,
      appAccountToken: profile?.appAccountToken || args.appAccountToken,
      revenueCatAppUserId: args.revenueCatAppUserId || profile?.revenueCatAppUserId || String(userId),
      referralCode: profile?.referralCode || normalizeReferralCode(args.referral?.code || "") || null,
    };
  },
});

export const billingIdentity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return {
      userId,
      email: user?.email || "",
      stripeCustomerId: profile?.stripeCustomerId || null,
      appAccountToken: profile?.appAccountToken || null,
      revenueCatAppUserId: profile?.revenueCatAppUserId || null,
      referralCode: profile?.referralCode || null,
    };
  },
});

export const deleteMyAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    for (const table of ["profiles", "preferences", "mealPlans", "usage", "subscriptions"] as const) {
      const rows = await ctx.db
        .query(table)
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();
      await Promise.all(rows.map((row) => ctx.db.delete(row._id)));
    }
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .collect();
    await Promise.all(sessions.map((row) => ctx.db.delete(row._id)));
    await Promise.all(accounts.map((row) => ctx.db.delete(row._id)));
    await ctx.db.delete(userId);
  },
});

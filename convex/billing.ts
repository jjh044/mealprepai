import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const applyStripeEvent = mutation({
  args: {
    syncSecret: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    customerId: v.string(),
    subscriptionId: v.optional(v.string()),
    priceId: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (!process.env.STRIPE_SYNC_SECRET || args.syncSecret !== process.env.STRIPE_SYNC_SECRET) {
      throw new Error("Unauthorized billing sync");
    }
    const duplicate = await ctx.db
      .query("stripeEvents")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (duplicate) return { duplicate: true };

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.customerId))
      .unique();
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_customer", (q) => q.eq("stripeCustomerId", args.customerId))
      .unique();
    const userId = existing?.userId || profile?.userId;
    if (!userId) throw new Error("Stripe customer is not linked to a PrepWise user");

    const value = {
      userId,
      stripeCustomerId: args.customerId,
      stripeSubscriptionId: args.subscriptionId,
      priceId: args.priceId,
      referralCode: args.referralCode || profile?.referralCode,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: Date.now(),
    };
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("subscriptions", value);
    await ctx.db.insert("stripeEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      processedAt: Date.now(),
    });
    return { duplicate: false };
  },
});

export const applyNativeSubscription = mutation({
  args: {
    syncSecret: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    productId: v.string(),
    originalTransactionId: v.string(),
    purchaseTokenHash: v.optional(v.string()),
    appAccountToken: v.optional(v.string()),
    revenueCatAppUserId: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!process.env.NATIVE_BILLING_SYNC_SECRET ||
        args.syncSecret !== process.env.NATIVE_BILLING_SYNC_SECRET) {
      throw new Error("Unauthorized native billing sync");
    }
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const value: any = {
      userId,
      platform: args.platform,
      productId: args.productId,
      originalTransactionId: args.originalTransactionId,
      priceId: args.productId,
      referralCode: args.referralCode || profile?.referralCode,
      status: args.status,
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    };
    if (args.purchaseTokenHash) value.purchaseTokenHash = args.purchaseTokenHash;
    if (args.appAccountToken || profile?.appAccountToken) {
      value.appAccountToken = args.appAccountToken || profile?.appAccountToken;
    }
    if (args.revenueCatAppUserId || profile?.revenueCatAppUserId) {
      value.revenueCatAppUserId = args.revenueCatAppUserId || profile?.revenueCatAppUserId;
    }
    if (args.currentPeriodEnd) value.currentPeriodEnd = args.currentPeriodEnd;
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("subscriptions", value);
    return { updated: true };
  },
});

export const applyRevenueCatEvent = mutation({
  args: {
    syncSecret: v.string(),
    eventId: v.string(),
    eventType: v.string(),
    appUserId: v.optional(v.string()),
    productId: v.optional(v.string()),
    originalTransactionId: v.optional(v.string()),
    appAccountToken: v.optional(v.string()),
    priceId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    referralCode: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!process.env.REVENUECAT_WEBHOOK_SECRET ||
        args.syncSecret !== process.env.REVENUECAT_WEBHOOK_SECRET) {
      throw new Error("Unauthorized RevenueCat sync");
    }
    const duplicate = await ctx.db
      .query("revenueCatEvents")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .unique();
    if (duplicate) return { duplicate: true };

    const existingByTransaction = args.originalTransactionId
      ? await ctx.db
          .query("subscriptions")
          .withIndex("by_original_transaction", (q) =>
            q.eq("originalTransactionId", args.originalTransactionId)
          )
          .unique()
      : null;
    const existingByRevenueCatUser = !existingByTransaction && args.appUserId
      ? await ctx.db
          .query("subscriptions")
          .withIndex("by_revenue_cat_app_user", (q) =>
            q.eq("revenueCatAppUserId", args.appUserId)
          )
          .unique()
      : null;
    const profileByRevenueCatUser = args.appUserId
      ? await ctx.db
          .query("profiles")
          .withIndex("by_revenue_cat_app_user", (q) =>
            q.eq("revenueCatAppUserId", args.appUserId)
          )
          .unique()
      : null;
    const profileByAppAccountToken = !profileByRevenueCatUser && args.appAccountToken
      ? await ctx.db
          .query("profiles")
          .withIndex("by_app_account_token", (q) =>
            q.eq("appAccountToken", args.appAccountToken)
          )
          .unique()
      : null;
    const profile = profileByRevenueCatUser || profileByAppAccountToken;
    const existing = existingByTransaction || existingByRevenueCatUser;
    const userId = existing?.userId || profile?.userId;

    await ctx.db.insert("revenueCatEvents", {
      eventId: args.eventId,
      eventType: args.eventType,
      ...(args.appUserId ? { appUserId: args.appUserId } : {}),
      ...(args.originalTransactionId ? { originalTransactionId: args.originalTransactionId } : {}),
      processedAt: Date.now(),
    });

    if (!userId) return { duplicate: false, linked: false };

    const value: any = {
      userId,
      platform: "ios",
      ...(args.productId ? { productId: args.productId } : {}),
      ...(args.originalTransactionId ? { originalTransactionId: args.originalTransactionId } : {}),
      ...(args.appAccountToken ? { appAccountToken: args.appAccountToken } : {}),
      ...(args.appUserId ? { revenueCatAppUserId: args.appUserId } : {}),
      ...(args.priceId ? { priceId: args.priceId } : args.productId ? { priceId: args.productId } : {}),
      referralCode: args.referralCode || existing?.referralCode || profile?.referralCode,
      status: args.status,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd ?? ["expired", "refunded", "revoked"].includes(args.status),
      updatedAt: Date.now(),
    };
    if (args.currentPeriodEnd) value.currentPeriodEnd = args.currentPeriodEnd;
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("subscriptions", value);
    return { duplicate: false, linked: true };
  },
});

export const applyAppleNotification = mutation({
  args: {
    syncSecret: v.string(),
    productId: v.string(),
    originalTransactionId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!process.env.NATIVE_BILLING_SYNC_SECRET ||
        args.syncSecret !== process.env.NATIVE_BILLING_SYNC_SECRET) {
      throw new Error("Unauthorized native billing sync");
    }
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_original_transaction", (q) =>
        q.eq("originalTransactionId", args.originalTransactionId)
      )
      .unique();
    if (!existing) return { updated: false };
    await ctx.db.patch(existing._id, {
      platform: "ios",
      productId: args.productId,
      priceId: args.productId,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    });
    return { updated: true };
  },
});

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
    referralCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
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
    const value = {
      userId,
      platform: args.platform,
      productId: args.productId,
      originalTransactionId: args.originalTransactionId,
      purchaseTokenHash: args.purchaseTokenHash,
      priceId: args.productId,
      referralCode: args.referralCode || profile?.referralCode,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    };
    if (existing) await ctx.db.patch(existing._id, value);
    else await ctx.db.insert("subscriptions", value);
    return { updated: true };
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

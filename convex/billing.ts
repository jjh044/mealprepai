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
      .filter((q) => q.eq(q.field("stripeCustomerId"), args.customerId))
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

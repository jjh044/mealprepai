import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  profiles: defineTable({
    userId: v.id("users"),
    stripeCustomerId: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    referralSourceParam: v.optional(v.string()),
    referralLandingPath: v.optional(v.string()),
    referralCapturedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_referral_code", ["referralCode"]),
  preferences: defineTable({
    userId: v.id("users"),
    budget: v.number(),
    zip: v.string(),
    people: v.number(),
    preference: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  mealPlans: defineTable({
    userId: v.id("users"),
    plan: v.any(),
    preferences: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_created", ["userId", "createdAt"]),
  usage: defineTable({
    userId: v.id("users"),
    period: v.string(),
    plans: v.number(),
    swaps: v.number(),
    ai: v.number(),
    updatedAt: v.number(),
  }).index("by_user_period", ["userId", "period"]),
  subscriptions: defineTable({
    userId: v.id("users"),
    platform: v.optional(v.string()),
    productId: v.optional(v.string()),
    originalTransactionId: v.optional(v.string()),
    purchaseTokenHash: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    priceId: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_customer", ["stripeCustomerId"])
    .index("by_subscription", ["stripeSubscriptionId"])
    .index("by_original_transaction", ["originalTransactionId"])
    .index("by_purchase_token_hash", ["purchaseTokenHash"]),
  stripeEvents: defineTable({
    eventId: v.string(),
    eventType: v.string(),
    processedAt: v.number(),
  }).index("by_event", ["eventId"]),
  referralClicks: defineTable({
    code: v.string(),
    landingPath: v.string(),
    ipHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_code_and_created", ["code", "createdAt"])
    .index("by_created", ["createdAt"]),
});

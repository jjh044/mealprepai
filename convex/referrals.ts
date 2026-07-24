import { mutation } from "./_generated/server";
import { v } from "convex/values";

function normalizeReferralCode(value: string) {
  const code = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return code.length >= 2 ? code : "";
}

export const recordClick = mutation({
  args: {
    syncSecret: v.string(),
    code: v.string(),
    landingPath: v.string(),
    ipHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!process.env.STRIPE_SYNC_SECRET || args.syncSecret !== process.env.STRIPE_SYNC_SECRET) {
      throw new Error("Unauthorized referral sync");
    }
    const code = normalizeReferralCode(args.code);
    if (!code) throw new Error("Invalid referral code");
    await ctx.db.insert("referralClicks", {
      code,
      landingPath: String(args.landingPath || "/").slice(0, 240),
      ipHash: args.ipHash,
      userAgentHash: args.userAgentHash,
      createdAt: Date.now(),
    });
    return { recorded: true, code };
  },
});

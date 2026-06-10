(function initPrepWiseSubscription(globalScope) {
  const PRODUCTS = Object.freeze({
    monthly: Object.freeze({
      id: "prepwise_pro_monthly",
      name: "PrepWise Pro Monthly",
      period: "month",
      level: 1
    }),
    yearly: Object.freeze({
      id: "prepwise_pro_yearly",
      name: "PrepWise Pro Yearly",
      period: "year",
      level: 1
    })
  });

  const FREE_LIMITS = Object.freeze({
    plans: 2,
    swaps: 3,
    ai: 1
  });

  const STORAGE_KEYS = Object.freeze({
    entitlement: "prepwise-subscription-entitlement",
    usage: "prepwise-subscription-usage"
  });

  function weekKey(date = new Date()) {
    const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = value.getUTCDay() || 7;
    value.setUTCDate(value.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((value - yearStart) / 86400000) + 1) / 7);
    return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function parseStored(storage, key, fallback) {
    try {
      return JSON.parse(storage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function createSubscriptionManager(options = {}) {
    const storage = options.storage;
    const now = options.now || (() => new Date());

    if (!storage) {
      throw new Error("A storage implementation is required");
    }

    function getEntitlement() {
      const entitlement = parseStored(storage, STORAGE_KEYS.entitlement, null);
      const validProductIds = Object.values(PRODUCTS).map((product) => product.id);

      if (!entitlement?.active || !validProductIds.includes(entitlement.productId)) {
        return { active: false, productId: null, source: null, state: "free" };
      }

      if (entitlement.expiresAt && new Date(entitlement.expiresAt) <= now()) {
        return { ...entitlement, active: false, state: "expired" };
      }

      return entitlement;
    }

    function getUsage() {
      const period = weekKey(now());
      const usage = parseStored(storage, STORAGE_KEYS.usage, null);
      if (!usage || usage.period !== period) {
        return { period, plans: 0, swaps: 0, ai: 0 };
      }

      return {
        period,
        plans: Math.max(0, Number(usage.plans) || 0),
        swaps: Math.max(0, Number(usage.swaps) || 0),
        ai: Math.max(0, Number(usage.ai) || 0)
      };
    }

    function saveUsage(usage) {
      storage.setItem(STORAGE_KEYS.usage, JSON.stringify(usage));
    }

    function isPro() {
      return getEntitlement().active;
    }

    function remaining(feature) {
      if (isPro()) return Number.POSITIVE_INFINITY;
      const limit = FREE_LIMITS[feature];
      if (typeof limit !== "number") return 0;
      return Math.max(0, limit - getUsage()[feature]);
    }

    function canUse(feature) {
      return isPro() || remaining(feature) > 0;
    }

    function consume(feature) {
      if (isPro()) return true;
      if (!canUse(feature)) return false;

      const usage = getUsage();
      usage[feature] += 1;
      saveUsage(usage);
      return true;
    }

    function activateDemo(productId) {
      const product = Object.values(PRODUCTS).find((item) => item.id === productId);
      if (!product) throw new Error("Unknown subscription product");

      const entitlement = {
        active: true,
        productId,
        source: "local-demo",
        state: "active",
        activatedAt: now().toISOString()
      };
      storage.setItem(STORAGE_KEYS.entitlement, JSON.stringify(entitlement));
      return entitlement;
    }

    function applyVerifiedEntitlement(update) {
      const validProductIds = Object.values(PRODUCTS).map((product) => product.id);
      const allowedStates = new Set([
        "active",
        "billing_retry",
        "grace_period",
        "expired",
        "refunded",
        "revoked"
      ]);

      if (!validProductIds.includes(update?.productId) || !allowedStates.has(update?.state)) {
        throw new Error("Invalid verified entitlement update");
      }

      const entitlement = {
        active: ["active", "billing_retry", "grace_period"].includes(update.state),
        productId: update.productId,
        source: update.source || "app-store",
        state: update.state,
        originalTransactionId: update.originalTransactionId || null,
        expiresAt: update.expiresAt || null,
        updatedAt: now().toISOString()
      };
      storage.setItem(STORAGE_KEYS.entitlement, JSON.stringify(entitlement));
      return entitlement;
    }

    function clearDemo() {
      const entitlement = getEntitlement();
      if (entitlement.source === "local-demo") {
        storage.removeItem(STORAGE_KEYS.entitlement);
      }
    }

    function status() {
      return {
        isPro: isPro(),
        entitlement: getEntitlement(),
        usage: getUsage(),
        remaining: {
          plans: remaining("plans"),
          swaps: remaining("swaps"),
          ai: remaining("ai")
        }
      };
    }

    return {
      activateDemo,
      applyVerifiedEntitlement,
      canUse,
      clearDemo,
      consume,
      getEntitlement,
      getUsage,
      isPro,
      remaining,
      status
    };
  }

  const api = {
    FREE_LIMITS,
    PRODUCTS,
    STORAGE_KEYS,
    createSubscriptionManager,
    weekKey
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.PrepWiseSubscription = api;
})(typeof window !== "undefined" ? window : globalThis);

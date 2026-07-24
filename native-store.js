(function initPrepWiseNativeStore(globalScope) {
  const PRODUCT_IDS = ["prepwise_pro_month_v2", "prepwise_pro_yearly"];

  function unavailableProducts() {
    return PRODUCT_IDS.map((id) => ({
      id,
      displayName: id.endsWith("yearly") ? "Yearly" : "Monthly",
      displayPrice: null,
      period: id.endsWith("yearly") ? "year" : "month",
      trial: null,
      available: false
    }));
  }

  function createStoreAdapter(options = {}) {
    const nativeStore = options.nativeStore || globalScope.PrepWiseNativeStore;

    async function loadProducts() {
      if (!nativeStore?.loadProducts) return unavailableProducts();
      const products = await nativeStore.loadProducts(PRODUCT_IDS);
      return PRODUCT_IDS.map((id) => {
        const product = products.find((item) => item.id === id);
        return product
          ? { ...product, available: true }
          : unavailableProducts().find((item) => item.id === id);
      });
    }

    async function purchase(productId, context = {}) {
      if (!PRODUCT_IDS.includes(productId)) throw new Error("Unknown product");
      if (!nativeStore?.purchase) return { state: "unavailable" };
      return nativeStore.purchase(productId, context);
    }

    async function restore() {
      if (!nativeStore?.restore) return { state: "unavailable" };
      return nativeStore.restore();
    }

    async function manageSubscriptions() {
      if (!nativeStore?.manageSubscriptions) return { state: "unavailable" };
      return nativeStore.manageSubscriptions();
    }

    return {
      isNative: Boolean(nativeStore),
      platform: nativeStore?.platform || "web",
      loadProducts,
      manageSubscriptions,
      purchase,
      refresh: async () => nativeStore?.refresh?.() || { state: "unavailable" },
      restore
    };
  }

  const api = { PRODUCT_IDS, createStoreAdapter, unavailableProducts };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.PrepWiseStore = api;
})(typeof window !== "undefined" ? window : globalThis);

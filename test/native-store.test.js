const assert = require("node:assert/strict");
const test = require("node:test");
const { PRODUCT_IDS, createStoreAdapter } = require("../native-store");

test("browser adapter does not invent App Store prices", async () => {
  const adapter = createStoreAdapter({ nativeStore: null });
  const products = await adapter.loadProducts();

  assert.equal(adapter.isNative, false);
  assert.deepEqual(products.map((product) => product.id), PRODUCT_IDS);
  assert.ok(products.every((product) => product.displayPrice === null));
});

test("native adapter preserves localized StoreKit product data", async () => {
  const adapter = createStoreAdapter({
    nativeStore: {
      async loadProducts() {
        return [
          {
            id: "prepwise_pro_yearly",
            displayName: "Yearly",
            displayPrice: "US$39.99",
            period: "year",
            trial: { displayText: "7 days free" }
          }
        ];
      }
    }
  });

  const products = await adapter.loadProducts();
  const yearly = products.find((product) => product.id === "prepwise_pro_yearly");
  assert.equal(adapter.isNative, true);
  assert.equal(yearly.displayPrice, "US$39.99");
  assert.equal(yearly.trial.displayText, "7 days free");
});

test("purchase, restore, and manage calls are delegated to the native bridge", async () => {
  const calls = [];
  const adapter = createStoreAdapter({
    nativeStore: {
      loadProducts: async () => [],
      purchase: async (id) => {
        calls.push(["purchase", id]);
        return { state: "pending" };
      },
      restore: async () => {
        calls.push(["restore"]);
        return { state: "restored" };
      },
      manageSubscriptions: async () => {
        calls.push(["manage"]);
        return { state: "opened" };
      }
    }
  });

  assert.equal((await adapter.purchase("prepwise_pro_monthly")).state, "pending");
  assert.equal((await adapter.restore()).state, "restored");
  assert.equal((await adapter.manageSubscriptions()).state, "opened");
  assert.deepEqual(calls, [
    ["purchase", "prepwise_pro_monthly"],
    ["restore"],
    ["manage"]
  ]);
});

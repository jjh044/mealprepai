const assert = require("node:assert/strict");
const test = require("node:test");
const {
  FREE_LIMITS,
  PRODUCTS,
  createSubscriptionManager,
  weekKey
} = require("../subscription");

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value))
  };
}

test("free usage is limited and resets in a new week", () => {
  const storage = memoryStorage();
  let now = new Date("2026-06-10T12:00:00Z");
  const manager = createSubscriptionManager({ storage, now: () => now });

  for (let index = 0; index < FREE_LIMITS.plans; index += 1) {
    assert.equal(manager.consume("plans"), true);
  }
  assert.equal(manager.canUse("plans"), false);
  assert.equal(manager.consume("plans"), false);

  now = new Date("2026-06-17T12:00:00Z");
  assert.equal(manager.canUse("plans"), true);
  assert.equal(manager.remaining("plans"), FREE_LIMITS.plans);
});

test("Pro products remove all usage limits", () => {
  const manager = createSubscriptionManager({
    storage: memoryStorage(),
    now: () => new Date("2026-06-10T12:00:00Z")
  });

  manager.activateDemo(PRODUCTS.yearly.id);

  assert.equal(manager.isPro(), true);
  assert.equal(manager.canUse("plans"), true);
  assert.equal(manager.canUse("swaps"), true);
  assert.equal(manager.canUse("ai"), true);
  assert.equal(manager.remaining("plans"), Number.POSITIVE_INFINITY);
});

test("only known subscription product identifiers can activate Pro", () => {
  const manager = createSubscriptionManager({ storage: memoryStorage() });
  assert.throws(() => manager.activateDemo("unknown_product"), /Unknown/);
});

test("verified lifecycle updates control Pro access", () => {
  const manager = createSubscriptionManager({
    storage: memoryStorage(),
    now: () => new Date("2026-06-10T12:00:00Z")
  });

  manager.applyVerifiedEntitlement({
    productId: PRODUCTS.monthly.id,
    state: "grace_period",
    originalTransactionId: "100"
  });
  assert.equal(manager.isPro(), true);

  manager.applyVerifiedEntitlement({
    productId: PRODUCTS.monthly.id,
    state: "refunded",
    originalTransactionId: "100"
  });
  assert.equal(manager.isPro(), false);
});

test("week keys are stable ISO week identifiers", () => {
  assert.equal(weekKey(new Date("2026-06-10T12:00:00Z")), "2026-W24");
});

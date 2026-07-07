const assert = require("node:assert/strict");
const test = require("node:test");
const {
  entitlementStateForNotification,
  entitlementUpdateFromVerifiedNotification,
  processSignedNotification
} = require("../app-store-notifications");

test("maps Apple lifecycle notifications to entitlement states", () => {
  assert.equal(entitlementStateForNotification("DID_RENEW"), "active");
  assert.equal(entitlementStateForNotification("DID_FAIL_TO_RENEW"), "billing_retry");
  assert.equal(entitlementStateForNotification("DID_FAIL_TO_RENEW", "GRACE_PERIOD"), "grace_period");
  assert.equal(entitlementStateForNotification("EXPIRED"), "expired");
  assert.equal(entitlementStateForNotification("REFUND"), "refunded");
  assert.equal(entitlementStateForNotification("REVOKE"), "revoked");
});

test("builds an entitlement only from verified transaction data", () => {
  const update = entitlementUpdateFromVerifiedNotification({
    notificationType: "DID_RENEW",
    transaction: {
      productId: "prepwise_pro_yearly",
      originalTransactionId: "1000000001",
      expiresDate: "2027-06-10T00:00:00.000Z"
    }
  });

  assert.equal(update.active, true);
  assert.equal(update.state, "active");
  assert.equal(update.productId, "prepwise_pro_yearly");
});

test("refuses signed notifications when verification is not configured", async () => {
  await assert.rejects(
    processSignedNotification("signed-payload-placeholder", null),
    (error) => error.statusCode === 503
  );
});

test("processes data returned by a signed-payload verifier", async () => {
  const result = await processSignedNotification(
    "signed-payload-placeholder",
    async () => ({
      notificationUUID: "uuid-1",
      notificationType: "REFUND",
      transaction: {
        productId: "prepwise_pro_month_v2",
        originalTransactionId: "1000000002"
      }
    })
  );

  assert.equal(result.notificationUUID, "uuid-1");
  assert.equal(result.update.state, "refunded");
  assert.equal(result.update.active, false);
});

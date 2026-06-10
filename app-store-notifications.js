const ACTIVE_STATES = new Set(["active", "billing_retry", "grace_period"]);

function entitlementStateForNotification(notificationType, subtype) {
  if (notificationType === "REFUND") return "refunded";
  if (notificationType === "REVOKE") return "revoked";
  if (notificationType === "EXPIRED" || notificationType === "GRACE_PERIOD_EXPIRED") return "expired";
  if (notificationType === "DID_FAIL_TO_RENEW") {
    return subtype === "GRACE_PERIOD" ? "grace_period" : "billing_retry";
  }
  if (
    notificationType === "SUBSCRIBED" ||
    notificationType === "DID_RENEW" ||
    notificationType === "DID_RECOVER" ||
    notificationType === "DID_CHANGE_RENEWAL_PREF" ||
    notificationType === "DID_CHANGE_RENEWAL_STATUS"
  ) {
    return "active";
  }
  return null;
}

function entitlementUpdateFromVerifiedNotification(notification) {
  const state = entitlementStateForNotification(notification.notificationType, notification.subtype);
  const transaction = notification.transaction || {};

  if (!state || !transaction.productId || !transaction.originalTransactionId) {
    return null;
  }

  return {
    active: ACTIVE_STATES.has(state),
    state,
    productId: transaction.productId,
    originalTransactionId: transaction.originalTransactionId,
    expiresAt: transaction.expiresDate || null,
    source: "app-store-server-notification"
  };
}

async function processSignedNotification(signedPayload, verifySignedPayload) {
  if (typeof signedPayload !== "string" || signedPayload.length < 20) {
    throw Object.assign(new Error("A signedPayload is required"), { statusCode: 400 });
  }
  if (typeof verifySignedPayload !== "function") {
    throw Object.assign(new Error("Apple notification verification is not configured"), { statusCode: 503 });
  }

  const verified = await verifySignedPayload(signedPayload);
  return {
    notificationUUID: verified.notificationUUID,
    update: entitlementUpdateFromVerifiedNotification(verified)
  };
}

module.exports = {
  entitlementStateForNotification,
  entitlementUpdateFromVerifiedNotification,
  processSignedNotification
};

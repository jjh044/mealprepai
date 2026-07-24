# StoreKit 2 Integration Contract

The web UI expects a native object at `window.PrepWiseNativeStore` with these asynchronous methods:

```js
loadProducts(["prepwise_pro_month_v2", "prepwise_pro_yearly"])
purchase(productId, { appAccountToken, revenueCatAppUserId })
restore()
manageSubscriptions()
```

`loadProducts` must return StoreKit-localized product values:

```json
{
  "id": "prepwise_pro_yearly",
  "displayName": "Yearly",
  "displayPrice": "$39.99",
  "period": "year",
  "trial": {
    "displayText": "7 days free"
  }
}
```

Purchase and restore results must use verified StoreKit transaction data:

```json
{
  "state": "success",
  "entitlement": {
    "productId": "prepwise_pro_yearly",
    "state": "active",
    "originalTransactionId": "100000000000",
    "expiresAt": "2027-06-10T00:00:00.000Z",
    "source": "storekit-verified"
  }
}
```

The native result also includes Apple's signed transaction JWS. The API verifies that JWS against Apple's root certificates before it persists or returns an entitlement. `APPLE_ENVIRONMENT=AUTO` accepts both TestFlight sandbox transactions and production App Store transactions; production verification also requires `APPLE_APP_ID`.

Before starting a native purchase, the web UI calls `/api/billing/native/context` with the signed-in user's referral payload. The endpoint returns a stable Apple `appAccountToken` UUID and a RevenueCat app user ID, stores them on the PrepWise profile, and preserves the first valid referral code. iOS purchases must pass the `appAccountToken` to StoreKit with `Product.PurchaseOption.appAccountToken` so App Store renewal transactions can continue carrying the PrepWise account association.

If RevenueCat is enabled, configure its webhook to call `/api/revenuecat/webhook` with the `REVENUECAT_WEBHOOK_SECRET` as a bearer token or `x-revenuecat-secret` header. RevenueCat events are matched back to Convex by app user ID, Apple original transaction ID, or app account token; the existing subscription referral code remains the commission attribution source.

Supported result states:

- `success`
- `restored`
- `pending`
- `cancelled`
- `active`
- `billing_retry`
- `grace_period`
- `expired`
- `refunded`
- `revoked`
- `unavailable`

Never grant Pro from an unverified transaction. Observe `Transaction.updates`, finish verified transactions, and refresh current entitlements at launch and foreground entry.

Configure App Store Server Notifications V2 to send production and sandbox notifications to `/api/app-store/notifications`. The endpoint verifies the notification and embedded transaction JWS before updating Convex.

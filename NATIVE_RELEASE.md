# PrepWise Native Release Setup

The iOS and Android projects are generated with Capacitor 8. The web bundle is
packaged locally; API requests continue to use the production Vercel backend.

## Build Commands

```powershell
npm run build
npm run native:sync
npm run check
npm run typecheck
npm test
```

## Android Requirements

1. Install Android Studio with its bundled JDK and Android SDK 36.
2. Set `JAVA_HOME` to Android Studio's JBR directory if Gradle cannot find Java.
3. Open `android/` in Android Studio.
4. Create both subscriptions in Google Play Console:
   - `prepwise_pro_monthly`
   - `prepwise_pro_yearly`
5. Create a Google Play service account with Android Publisher access.
6. Add the production service-account JSON to Vercel as
   `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
7. Set `GOOGLE_PLAY_PACKAGE_NAME=com.prepwise.app`.
8. Build a signed Android App Bundle and test purchases on a Play testing track.

Play listing assets are in `app-store/android/`.

## iOS Requirements

1. Open `ios/App/App.xcodeproj` on a Mac with Xcode 26.
2. Select the Apple Developer team and confirm bundle ID `com.prepwise.app`.
3. Create both subscriptions in App Store Connect:
   - `prepwise_pro_monthly`
   - `prepwise_pro_yearly`
4. Download Apple's current root certificates from Apple PKI.
5. DER-encode and Base64-encode the certificates, then store the JSON array in
   Vercel as `APPLE_ROOT_CA_BASE64_JSON`.
6. Set `APPLE_BUNDLE_ID`, `APPLE_ENVIRONMENT`, and production `APPLE_APP_ID`.
7. Configure App Store Server Notifications at
   `/api/app-store/notifications`.
8. Test purchases, restoration, renewal, expiration, refund, and revocation in
   StoreKit sandbox and TestFlight.

## Shared Backend Requirement

Set the same long random `NATIVE_BILLING_SYNC_SECRET` in Vercel and the Convex
production deployment. Native purchases fail closed when verification is not
configured.

After changing native code or web files, run `npm run native:sync` before
building in Android Studio or Xcode.

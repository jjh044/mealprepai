# Native Release Builds

Both apps use bundle identifier `com.prepwise.app`, marketing version `1.0`, and build number/version code `1`.

## Readiness check

Run:

```text
npm run release:check
```

Use `node scripts/check-native-release.js --require-signing` before producing the final Android bundle.

## Android App Bundle

Keep the Play upload keystore outside this repository. Set these environment variables in the build environment:

```text
PREPWISE_ANDROID_KEYSTORE_PATH
PREPWISE_ANDROID_KEYSTORE_PASSWORD
PREPWISE_ANDROID_KEY_ALIAS
PREPWISE_ANDROID_KEY_PASSWORD
```

Then run `android/gradlew.bat bundleRelease`. The signed bundle is written beneath `android/app/build/outputs/bundle/release/`.

Google Play App Signing should hold the app-signing key. Retain the upload keystore and passwords in a password manager with a secure backup.

## iOS archive

iOS archives require macOS, Xcode, an Apple Developer team, and an App Store Connect app record for `com.prepwise.app`. In Xcode:

1. Select the PrepWise target and assign the developer team under Signing & Capabilities.
2. Keep automatic signing enabled for Release.
3. Select Any iOS Device, then Product > Archive.
4. Validate and upload the archive through Organizer.

Increment `CURRENT_PROJECT_VERSION` and Android `versionCode` for every uploaded replacement build.

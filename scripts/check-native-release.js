const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];

function requireMatch(file, pattern, message) {
  if (!pattern.test(read(file))) failures.push(message);
}

requireMatch("capacitor.config.ts", /appId:\s*"com\.prepwise\.app"/, "Capacitor app ID is incorrect.");
requireMatch("android/app/build.gradle", /applicationId "com\.prepwise\.app"/, "Android application ID is incorrect.");
requireMatch("android/app/build.gradle", /targetSdkVersion\s+rootProject\.ext\.targetSdkVersion/, "Android target SDK is not centralized.");
requireMatch("android/app/src/main/AndroidManifest.xml", /android:allowBackup="false"/, "Android backups must be disabled.");
requireMatch("android/app/src/main/AndroidManifest.xml", /android:usesCleartextTraffic="false"/, "Android cleartext traffic must be disabled.");
requireMatch("ios/App/App.xcodeproj/project.pbxproj", /PRODUCT_BUNDLE_IDENTIFIER = com\.prepwise\.app;/, "iOS bundle ID is incorrect.");
requireMatch("ios/App/App.xcodeproj/project.pbxproj", /MARKETING_VERSION = 1\.0;/, "iOS marketing version is missing.");
requireMatch("ios/App/App.xcodeproj/project.pbxproj", /CURRENT_PROJECT_VERSION = 1;/, "iOS build number is missing.");
requireMatch("ios/App/App.xcodeproj/project.pbxproj", /PrivacyInfo\.xcprivacy in Resources/, "iOS privacy manifest is not packaged.");

const signingVariables = [
  "PREPWISE_ANDROID_KEYSTORE_PATH",
  "PREPWISE_ANDROID_KEYSTORE_PASSWORD",
  "PREPWISE_ANDROID_KEY_ALIAS",
  "PREPWISE_ANDROID_KEY_PASSWORD",
];
const configuredSigningVariables = signingVariables.filter((name) => Boolean(process.env[name]));
if (configuredSigningVariables.length > 0 && configuredSigningVariables.length < signingVariables.length) {
  failures.push(`Android signing is incomplete. Missing: ${signingVariables.filter((name) => !process.env[name]).join(", ")}`);
}
if (process.argv.includes("--require-signing") && configuredSigningVariables.length !== signingVariables.length) {
  failures.push("Android release signing credentials are required.");
}
if (process.env.PREPWISE_ANDROID_KEYSTORE_PATH && !fs.existsSync(process.env.PREPWISE_ANDROID_KEYSTORE_PATH)) {
  failures.push("PREPWISE_ANDROID_KEYSTORE_PATH does not exist.");
}

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`ERROR: ${failure}`));
  process.exitCode = 1;
} else {
  const signing = configuredSigningVariables.length === signingVariables.length ? "configured" : "not configured";
  console.log(`Native release configuration passed. Android signing: ${signing}.`);
}

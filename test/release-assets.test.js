const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

function read(filename) {
  return fs.readFileSync(path.join(__dirname, "..", filename), "utf8");
}

function pngInfo(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.subarray(1, 4).toString(), "PNG");
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25]
  };
}

test("App Store icon is opaque and exactly 1024 square", () => {
  const info = pngInfo(path.join(__dirname, "..", "app-store", "assets", "app-icon-1024.png"));
  assert.deepEqual(info, { width: 1024, height: 1024, colorType: 2 });
});

test("six App Store screenshots use the accepted 1290 by 2796 size", () => {
  const directory = path.join(__dirname, "..", "app-store", "screenshots");
  const screenshots = fs.readdirSync(directory)
    .filter((name) => /^\d{2}-.*\.png$/.test(name));

  assert.equal(screenshots.length, 6);
  screenshots.forEach((name) => {
    const info = pngInfo(path.join(directory, name));
    assert.equal(info.width, 1290);
    assert.equal(info.height, 2796);
  });
});

test("Google Play assets use release-ready dimensions", () => {
  const root = path.join(__dirname, "..", "app-store", "android");
  assert.deepEqual(pngInfo(path.join(root, "play-icon-512.png")).width, 512);
  const feature = pngInfo(path.join(root, "feature-graphic-1024x500.png"));
  assert.equal(feature.width, 1024);
  assert.equal(feature.height, 500);

  const screenshots = fs.readdirSync(path.join(root, "screenshots"))
    .filter((name) => /^\d{2}-.*\.png$/.test(name));
  assert.equal(screenshots.length, 6);
  screenshots.forEach((name) => {
    const info = pngInfo(path.join(root, "screenshots", name));
    assert.equal(info.width, 1080);
    assert.equal(info.height, 1920);
  });
});

test("native projects include first-party platform billing bridges", () => {
  const root = path.join(__dirname, "..");
  const android = fs.readFileSync(
    path.join(root, "android", "app", "src", "main", "java", "com", "prepwise", "app", "PrepWiseBillingPlugin.java"),
    "utf8"
  );
  const ios = fs.readFileSync(
    path.join(root, "ios", "App", "App", "PrepWiseBillingPlugin.swift"),
    "utf8"
  );
  assert.match(android, /BillingClient/);
  assert.match(android, /purchaseToken/);
  assert.match(ios, /import StoreKit/);
  assert.match(ios, /Transaction\.currentEntitlements/);
  assert.match(ios, /signedTransaction: update\.jwsRepresentation/);
  assert.match(read("client.js"), /Native store entitlement is missing server verification data/);
});

test("Apple billing accepts verified sandbox and production transactions", () => {
  const server = read("server.js");
  assert.match(server, /APPLE_ENVIRONMENT \|\| "AUTO"/);
  assert.match(server, /AppleEnvironment\.PRODUCTION, AppleEnvironment\.SANDBOX/);
  assert.match(server, /verifyAndDecodeNotification/);
  assert.match(server, /verifyAndDecodeTransaction/);
});

test("native release configuration keeps signing secrets external", () => {
  const gradle = read("android/app/build.gradle");
  const manifest = read("android/app/src/main/AndroidManifest.xml");
  const ignore = read(".gitignore");

  assert.match(gradle, /PREPWISE_ANDROID_KEYSTORE_PATH/);
  assert.match(gradle, /PREPWISE_ANDROID_KEYSTORE_PASSWORD/);
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(ignore, /\*\.jks/);
  assert.match(ignore, /\*\.p12/);
});

test("web builds package photographic recipe fallbacks", () => {
  const buildScript = read("scripts/build-web.js");

  assert.match(buildScript, /assets", "recipe-fallbacks/);
  ["breakfast", "lunch", "dinner"].forEach((meal) => {
    assert.equal(fs.existsSync(`assets/recipe-fallbacks/${meal}.jpg`), true);
  });
});

test("native runtime loads before the store adapter and routes API calls remotely", () => {
  const html = read("index.html");
  assert.ok(html.indexOf("native-runtime.js") < html.indexOf("native-store.js"));
  assert.match(read("src/native-runtime.js"), /PrepWiseApiOrigin/);
  assert.match(read("src/native-runtime.js"), /https:\/\/www\.prepwiseai\.app/);
  assert.doesNotMatch(read("src/native-runtime.js"), /PRODUCTION_ORIGIN = "https:\/\/prepwiseai\.app"/);
  assert.match(read("client.js"), /billing\/native\/verify/);
  assert.match(read("styles.css"), /safe-area-inset-bottom/);
});

test("public legal pages cover required privacy and subscription topics", () => {
  const root = path.join(__dirname, "..");
  const privacy = fs.readFileSync(path.join(root, "privacy.html"), "utf8");
  const terms = fs.readFileSync(path.join(root, "terms.html"), "utf8");
  const account = fs.readFileSync(path.join(root, "index.html"), "utf8");

  [
    "ZIP code",
    "dietary preferences",
    "saved meal plans",
    "purchase",
    "OpenAI",
    "Retention and deletion",
    "withdraw"
  ].forEach((text) => assert.match(privacy, new RegExp(text, "i")));
  assert.match(terms, /auto-renewing/i);
  assert.match(account, /Delete account and local data/i);
  assert.match(account, /Restore purchases/i);
  assert.match(account, /Manage subscription/i);
});

test("creator partner page is routable and includes partnership details", () => {
  const partners = read("partners.html");
  const readme = read("README.md");
  const vercel = read("vercel.json");

  assert.match(partners, /Creator partnership program/i);
  assert.match(partners, /revenue share/i);
  assert.match(partners, /handpicking a small founding group/i);
  assert.match(partners, /View the app/i);
  assert.match(partners, /IF THIS FEELS LIKE A FIT/i);
  assert.match(partners, /No revenue-share terms are guaranteed/i);
  assert.match(read("index.html"), /href="\/partners"/);
  assert.match(readme, /https:\/\/prepwiseai\.app\/partners/);
  assert.match(vercel, /partners\.html/);
  assert.match(vercel, /"src": "\/partners"/);
});

test("production HTML loads the analytics and error-monitoring bundle", () => {
  const html = read("index.html");
  assert.match(html, /telemetry\.js/);
  assert.match(read("privacy.html"), /PostHog/);
  assert.match(read("privacy.html"), /Sentry/);
});

test("account signup surfaces expected auth errors without opaque Convex failures", () => {
  const auth = read("convex/auth.ts");
  const bridge = read("src/cloud-bridge.jsx");

  assert.match(auth, /ConvexError/);
  assert.match(auth, /Enter a valid email address/);
  assert.match(auth, /Password must be at least 10 characters/);
  assert.match(bridge, /authValidationMessage/);
  assert.match(bridge, /authErrorMessage/);
  assert.match(bridge, /An account already exists for this email\. Sign in instead\./);
  assert.match(bridge, /We could not create the account/);
});

test("free plan badge shows limits without opening subscription choices", () => {
  const html = read("index.html");
  const client = read("client.js");
  const styles = read("styles.css");

  assert.match(html, /<small id="subscription-detail">Weekly limits<\/small>/);
  assert.match(client, /subscriptionButton\.addEventListener\("click"/);
  assert.match(client, /usageBanner\.scrollIntoView/);
  assert.match(styles, /html\s*\{\s*overflow-x:\s*clip;/);
  assert.match(styles, /input:not\(\[type="range"\]\):not\(\[type="checkbox"\]\):not\(\[type="radio"\]\),[\s\S]*textarea,[\s\S]*select,[\s\S]*font-size: 16px;/);
  assert.match(styles, /@media \(max-width: 900px\)[\s\S]*\.steps\s*\{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);[\s\S]*overflow-x: clip;/);
  assert.doesNotMatch(
    client,
    /status\.isPro[\s\S]{0,140}Free includes weekly meal planning[\s\S]{0,80}openPaywall/
  );
});

test("App Store metadata stays within name and subtitle limits", () => {
  const metadata = fs.readFileSync(
    path.join(__dirname, "..", "app-store", "metadata.md"),
    "utf8"
  );
  const appName = metadata.match(/App name: `([^`]+)`/)[1];
  const subtitle = metadata.match(/Subtitle: `([^`]+)`/)[1];

  assert.ok(appName.length <= 30);
  assert.ok(subtitle.length <= 30);
});

test("Google Play metadata stays within official listing limits", () => {
  const metadata = read("app-store/google-play-metadata.md");
  const appName = metadata.match(/App name: `([^`]+)`/)[1];
  const shortDescription = metadata
    .match(/## Short description\s+([\s\S]*?)\s+## Full description/)[1]
    .trim();
  const fullDescription = metadata
    .match(/## Full description\s+([\s\S]*?)\s+## Subscription products/)[1]
    .trim();

  assert.ok(appName.length <= 30);
  assert.ok(shortDescription.length <= 80);
  assert.ok(fullDescription.length <= 4000);
  assert.match(metadata, /Account deletion URL: `https:\/\/www\.prepwiseai\.app\/support\.html`/);
});

test("store submission documents match production account and privacy behavior", () => {
  const reviewNotes = read("app-store/review-notes.md");
  const appleMetadata = read("app-store/metadata.md");
  const privacyManifest = read("ios/App/App/PrivacyInfo.xcprivacy");

  assert.doesNotMatch(reviewNotes, /REPLACE_BEFORE_SUBMISSION/);
  assert.match(reviewNotes, /Production cloud authentication is enabled/);
  assert.match(appleMetadata, /https:\/\/www\.prepwiseai\.app\/privacy\.html/);
  assert.match(appleMetadata, /Terms of Use: https:\/\/www\.prepwiseai\.app\/terms\.html/);
  assert.match(appleMetadata, /Apple Standard EULA: https:\/\/www\.apple\.com\/legal\/internet-services\/itunes\/dev\/stdeula\//);
  assert.match(reviewNotes, /App Store Description includes the Terms of Use URL and standard Apple EULA URL/);
  assert.match(privacyManifest, /NSPrivacyCollectedDataTypeProductInteraction/);
  assert.match(privacyManifest, /NSPrivacyCollectedDataTypeCrashData/);
  assert.match(privacyManifest, /NSPrivacyCollectedDataTypePerformanceData/);
  assert.match(read("privacy.html"), /Google processes Google Play payments/);
  assert.match(read("terms.html"), /Google Play subscription/);
});

test("production beta smoke gate covers release-critical services", () => {
  const smoke = read("scripts/smoke-production.js");

  assert.match(smoke, /\/api\/health/);
  assert.match(smoke, /\/api\/config/);
  assert.match(smoke, /Native app CORS/);
  assert.match(smoke, /Recipe inventory and thumbnails/);
  assert.match(smoke, /Protected account deletion/);
  assert.match(smoke, /Native purchase verification rejects malformed data/);
  assert.match(read("package.json"), /"smoke:production"/);
});

test("official YouTube Data API configuration replaces YouTube138", () => {
  const root = path.join(__dirname, "..");
  const server = fs.readFileSync(path.join(root, "server.js"), "utf8");
  const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");

  assert.match(server, /www\.googleapis\.com/);
  assert.match(server, /YOUTUBE_API_KEY/);
  assert.doesNotMatch(server, /youtube138/i);
  assert.match(envExample, /YOUTUBE_API_KEY/);
  assert.doesNotMatch(envExample, /RAPIDAPI_YOUTUBE_HOST/);
});

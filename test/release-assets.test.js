const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

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

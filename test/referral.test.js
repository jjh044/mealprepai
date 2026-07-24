const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const {
  appendReferralToUrl,
  captureReferralFromLocation,
  normalizeReferralCode,
  referralRequestPayload
} = require("../referral");
const handleRequest = require("../server");

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value))
  };
}

async function withServer(run) {
  const server = http.createServer(handleRequest);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  try {
    const address = server.address();
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("referral codes are sanitized for URLs and storage", () => {
  assert.equal(normalizeReferralCode(" Mrs Mommy Marshall! "), "mrsmommymarshall");
  assert.equal(normalizeReferralCode("ab"), "ab");
  assert.equal(normalizeReferralCode("a"), "");
});

test("referral attribution is captured and reused across app links", () => {
  const storage = memoryStorage();
  const now = Date.parse("2026-07-23T12:00:00Z");
  const captured = captureReferralFromLocation(
    { pathname: "/partners", search: "?via=Creator_01&utm_source=tiktok" },
    storage,
    now
  );

  assert.equal(captured.code, "creator_01");
  assert.equal(captured.sourceParam, "via");
  assert.equal(referralRequestPayload(storage, now).code, "creator_01");
  assert.equal(appendReferralToUrl("index.html", storage, now), "/index.html?via=creator_01");
});

test("short referral links redirect into the app with a via parameter", async () => {
  const originalAppEnv = process.env.APP_ENV;
  process.env.APP_ENV = "production";
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/r/Creator_01`, { redirect: "manual" });

      assert.equal(response.status, 302);
      assert.equal(response.headers.get("location"), "/?via=creator_01");
    });
  } finally {
    if (originalAppEnv === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = originalAppEnv;
  }
});

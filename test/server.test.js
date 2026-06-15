const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const handleRequest = require("../server");

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

test("health endpoint reports service configuration without secrets", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
    assert.equal(typeof body.services.openai, "boolean");
    assert.equal(typeof body.services.rapidapi, "boolean");
    assert.equal(typeof body.services.youtube, "boolean");
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
});

test("public config exposes only client-safe service state", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/config`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(typeof body.convexUrl, "string");
    assert.equal(typeof body.billingConfigured, "boolean");
    assert.equal(typeof body.devBillingBypass, "boolean");
    assert.equal(typeof body.instacartProductsEnabled, "boolean");
    assert.equal(typeof body.tastyProviderEnabled, "boolean");
    assert.equal(typeof body.posthogKey, "string");
    assert.equal(typeof body.sentryDsn, "string");
    assert.equal("devBillingBypassSecret" in body, false);
    assert.equal("DEV_BILLING_BYPASS" in body, false);
    assert.equal("stripeSecretKey" in body, false);
    assert.equal("webhookSecret" in body, false);
    assert.equal("sentryAuthToken" in body, false);
    assert.equal("rapidApiKey" in body, false);
    assert.equal("openAiKey" in body, false);
  });
});

test("development billing bypass is opt-in and disabled in production", async () => {
  const originalAppEnv = process.env.APP_ENV;
  const originalBypass = process.env.DEV_BILLING_BYPASS;

  try {
    process.env.APP_ENV = "development";
    process.env.DEV_BILLING_BYPASS = "true";
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/config`);
      const body = await response.json();
      assert.equal(body.devBillingBypass, true);
    });

    process.env.APP_ENV = "production";
    process.env.DEV_BILLING_BYPASS = "true";
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/config`);
      const body = await response.json();
      assert.equal(body.devBillingBypass, false);
    });
  } finally {
    if (originalAppEnv === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = originalAppEnv;
    if (originalBypass === undefined) delete process.env.DEV_BILLING_BYPASS;
    else process.env.DEV_BILLING_BYPASS = originalBypass;
  }
});

test("development billing bypass prevents Stripe checkout creation", async () => {
  const originalAppEnv = process.env.APP_ENV;
  const originalBypass = process.env.DEV_BILLING_BYPASS;

  process.env.APP_ENV = "development";
  process.env.DEV_BILLING_BYPASS = "true";
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" })
      });
      const body = await response.json();

      assert.equal(response.status, 409);
      assert.match(body.error, /Development billing bypass/);
    });
  } finally {
    if (originalAppEnv === undefined) delete process.env.APP_ENV;
    else process.env.APP_ENV = originalAppEnv;
    if (originalBypass === undefined) delete process.env.DEV_BILLING_BYPASS;
    else process.env.DEV_BILLING_BYPASS = originalBypass;
  }
});

test("native Capacitor origins can call authenticated API routes", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/config`, {
      headers: { Origin: "https://app.prepwise.local" }
    });
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get("access-control-allow-origin"),
      "https://app.prepwise.local"
    );

    const preflight = await fetch(`${baseUrl}/api/account/delete`, {
      method: "OPTIONS",
      headers: {
        Origin: "capacitor://app.prepwise.local",
        "Access-Control-Request-Method": "DELETE",
        "Access-Control-Request-Headers": "authorization"
      }
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get("access-control-allow-headers"), /Authorization/);
  });
});

test("commercially unapproved scraper endpoints are disabled by default", async () => {
  const original = process.env.ENABLE_INSTACART_SCRAPER;
  delete process.env.ENABLE_INSTACART_SCRAPER;
  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/instacart/products`);
      assert.equal(response.status, 403);
    });
  } finally {
    if (original !== undefined) process.env.ENABLE_INSTACART_SCRAPER = original;
  }
});

test("store endpoint rejects invalid ZIP codes", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/stores?zip=invalid`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.error, /5-digit/);
  });
});

test("recipe responses stay within the provider cache allowance", async () => {
  const originalRapidApiKey = process.env.RAPIDAPI_KEY;
  const originalYoutubeKey = process.env.YOUTUBE_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  delete process.env.RAPIDAPI_KEY;
  delete process.env.YOUTUBE_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/recipes?preference=balanced`);
      assert.match(response.headers.get("cache-control"), /s-maxage=3600/);
    });
  } finally {
    if (originalRapidApiKey) process.env.RAPIDAPI_KEY = originalRapidApiKey;
    if (originalYoutubeKey) process.env.YOUTUBE_API_KEY = originalYoutubeKey;
    if (originalOpenAiKey) process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
});

test("JSON endpoints reject oversized request bodies", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ingredients/normalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: [{ name: "x".repeat(70 * 1024) }] })
    });

    assert.equal(response.status, 413);
  });
});

test("App Store notification endpoint rejects unverified payload processing", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/app-store/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedPayload: "signed-payload-placeholder" })
    });

    assert.equal(response.status, 503);
  });
});

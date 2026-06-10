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

test("store endpoint rejects invalid ZIP codes", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/stores?zip=invalid`);
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.match(body.error, /5-digit/);
  });
});

test("recipe responses advertise a shared provider-quota cache", async () => {
  const originalRapidApiKey = process.env.RAPIDAPI_KEY;
  const originalYoutubeKey = process.env.YOUTUBE_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  delete process.env.RAPIDAPI_KEY;
  delete process.env.YOUTUBE_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/recipes?preference=balanced`);
      assert.match(response.headers.get("cache-control"), /s-maxage=21600/);
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

const ORIGIN = String(process.env.PREPWISE_SMOKE_ORIGIN || "https://www.prepwiseai.app").replace(/\/$/, "");
const EXPECTED_RELEASE = process.env.PREPWISE_EXPECTED_RELEASE || "";
const NATIVE_ORIGIN = "https://app.prepwise.local";
const results = [];

function invariant(value, message) {
  if (!value) throw new Error(message);
}

async function request(path, options = {}) {
  const startedAt = Date.now();
  const response = await fetch(`${ORIGIN}${path}`, {
    signal: AbortSignal.timeout(30000),
    ...options,
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  return { response, body, durationMs: Date.now() - startedAt };
}

async function check(name, task) {
  const startedAt = Date.now();
  try {
    const detail = await task();
    results.push({ name, status: "PASS", durationMs: Date.now() - startedAt, detail });
  } catch (error) {
    results.push({ name, status: "FAIL", durationMs: Date.now() - startedAt, detail: error.message });
  }
}

async function main() {
  await check("Apex redirects to canonical HTTPS host", async () => {
    const response = await fetch("https://prepwiseai.app", { redirect: "manual", signal: AbortSignal.timeout(15000) });
    invariant([307, 308].includes(response.status), `Expected redirect, received ${response.status}`);
    invariant(response.headers.get("location")?.startsWith("https://www.prepwiseai.app"), "Unexpected redirect target");
    return `${response.status} ${response.headers.get("location")}`;
  });

  await check("Production health", async () => {
    const { response, body, durationMs } = await request("/api/health");
    invariant(response.ok && body.status === "ok", `Health returned ${response.status}`);
    for (const service of ["convex", "openai", "rapidapi", "stripe", "youtube"]) {
      invariant(body.services?.[service] === true, `${service} is not configured`);
    }
    return `${durationMs}ms; core services configured`;
  });

  await check("Public production configuration", async () => {
    const { response, body } = await request("/api/config");
    invariant(response.ok, `Config returned ${response.status}`);
    invariant(body.environment === "production", `Unexpected environment ${body.environment}`);
    invariant(body.devBillingBypass === false, "Development billing bypass is enabled");
    invariant(body.convexUrl === "https://expert-rabbit-478.convex.cloud", "Production Convex URL is incorrect");
    invariant(body.billingConfigured === true, "Web billing is not configured");
    if (EXPECTED_RELEASE) invariant(body.release === EXPECTED_RELEASE, `Expected release ${EXPECTED_RELEASE}, received ${body.release}`);
    return `release ${body.release || "unknown"}`;
  });

  const pages = [
    ["App", "/", "PrepWise"],
    ["Support", "/support.html", "Google Play subscriptions"],
    ["Privacy", "/privacy.html", "Google processes Google Play payments"],
    ["Terms", "/terms.html", "Google Play subscription"],
  ];
  for (const [name, path, requiredText] of pages) {
    await check(`${name} page`, async () => {
      const { response, body } = await request(path);
      invariant(response.ok, `${path} returned ${response.status}`);
      invariant(String(body).includes(requiredText), `${path} is missing current release content`);
      return `${path} returned HTML`;
    });
  }

  await check("Native app CORS", async () => {
    const { response } = await request("/api/config", { headers: { Origin: NATIVE_ORIGIN } });
    invariant(response.headers.get("access-control-allow-origin") === NATIVE_ORIGIN, "Native origin was not allowed");
    return NATIVE_ORIGIN;
  });

  await check("Recipe inventory and thumbnails", async () => {
    const { response, body, durationMs } = await request("/api/recipes?preference=balanced");
    invariant(response.ok && Array.isArray(body), `Recipes returned ${response.status}`);
    invariant(body.length >= 15, `Only ${body.length} recipes returned`);
    const ids = new Set(body.map((recipe) => recipe.id));
    const images = new Set(body.map((recipe) => recipe.image));
    invariant(ids.size === body.length, "Recipe IDs are not unique");
    invariant(images.size === body.length, "Recipe thumbnails are not unique");
    for (const meal of ["Breakfast", "Lunch", "Dinner"]) {
      invariant(body.filter((recipe) => recipe.meal === meal).length >= 5, `${meal} has fewer than five choices`);
    }
    invariant(body.every((recipe) => /^https:\/\/(?:i\.ytimg\.com|[^/]*spoonacular\.com|[^/]*buzzfeed\.com|[^/]*tasty\.co)\//i.test(recipe.image)), "An untrusted recipe thumbnail was returned");
    return `${body.length} unique recipes and images in ${durationMs}ms`;
  });

  await check("Protected account deletion", async () => {
    const { response } = await request("/api/account/delete", { method: "DELETE" });
    invariant([401, 403].includes(response.status), `Unauthenticated deletion returned ${response.status}`);
    return `blocked with ${response.status}`;
  });

  await check("Native purchase verification rejects malformed data", async () => {
    const { response } = await request("/api/billing/native/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "ios", signedTransaction: "invalid" }),
    });
    invariant(response.status === 400, `Malformed transaction returned ${response.status}`);
    return "blocked with 400";
  });

  console.table(results);
  if (results.some((result) => result.status === "FAIL")) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

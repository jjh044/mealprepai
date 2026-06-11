const fs = require("fs");
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");
const Stripe = require("stripe");
const Sentry = require("@sentry/node");
const { ConvexHttpClient } = require("convex/browser");
const { anyApi } = require("convex/server");
const { processSignedNotification } = require("./app-store-notifications");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MAX_JSON_BODY_BYTES = 64 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestBuckets = new Map();
const routeBuckets = new Map();
loadLocalEnv();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.APP_ENV || "production",
    release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    sendDefaultPii: false,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
  });
}

const RAPIDAPI_HOST =
  process.env.RAPIDAPI_SPOONACULAR_HOST || "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com";
const EDAMAM_RAPIDAPI_HOST =
  process.env.RAPIDAPI_EDAMAM_HOST || "edamam-food-and-grocery-database.p.rapidapi.com";
const INSTACART_RAPIDAPI_HOST =
  process.env.RAPIDAPI_INSTACART_HOST || "instacart-api1.p.rapidapi.com";
const GOOGLE_PLACES_RAPIDAPI_HOST =
  process.env.RAPIDAPI_GOOGLE_PLACES_HOST || "google-map-places.p.rapidapi.com";
const GOOGLE_PLACES_NEW_RAPIDAPI_HOST =
  process.env.RAPIDAPI_GOOGLE_PLACES_NEW_HOST || "google-map-places-new-v2.p.rapidapi.com";
const TASTY_RAPIDAPI_HOST =
  process.env.RAPIDAPI_TASTY_HOST || "tasty.p.rapidapi.com";
const ingredientCache = new Map();
const instacartCache = new Map();
const instacartProductCache = new Map();
const storeCache = new Map();
const youtubeRecipeCache = new Map();
const curatedYoutubeRecipes = [
  {
    id: "youtube-breakfast-mI--h_Ey6Ck",
    meal: "Breakfast",
    title: "Overnight Oats",
    summary: "Creamy overnight oats with milk, yogurt, chia seeds, and berries.",
    cost: 2.25,
    minutes: 10,
    protein: 18,
    tags: ["balanced", "vegetarian", "gluten-free", "quick", "batch", "leftovers"],
    provider: "YouTube + AI",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=mI--h_Ey6Ck",
    image: "https://i.ytimg.com/vi/mI--h_Ey6Ck/hqdefault.jpg",
    ingredients: [
      ["rolled oats", 0.5, "cup", "pantry"],
      ["milk", 0.5, "cup", "dairy"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["chia seeds", 1, "tbsp", "pantry"],
      ["berries", 0.5, "cup", "produce"]
    ]
  },
  {
    id: "youtube-breakfast-5s0eRgZjlwU",
    meal: "Breakfast",
    title: "Cheesy Baked Eggs",
    summary: "Baked eggs with cheddar and Parmesan cooked until just set.",
    cost: 2.5,
    minutes: 20,
    protein: 22,
    tags: ["balanced", "high-protein", "vegetarian", "gluten-free", "quick", "batch"],
    provider: "YouTube + AI",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=5s0eRgZjlwU",
    image: "https://i.ytimg.com/vi/5s0eRgZjlwU/hqdefault.jpg",
    ingredients: [
      ["eggs", 2, "each", "dairy"],
      ["cheddar cheese", 0.25, "cup", "dairy"],
      ["Parmesan cheese", 1, "tbsp", "dairy"],
      ["butter", 1, "tsp", "dairy"],
      ["black pepper", 0.25, "tsp", "pantry"]
    ]
  },
  {
    id: "youtube-lunch-AYNvbkN1gvA",
    meal: "Lunch",
    title: "Chicken Crunch Wraps",
    summary: "Seasoned chicken crunch wraps with yogurt sauce, lettuce, tomato, and mozzarella.",
    cost: 4.75,
    minutes: 30,
    protein: 42,
    tags: ["balanced", "high-protein", "batch", "family", "leftovers"],
    provider: "YouTube + AI",
    source: "Chef Jack Ovens",
    sourceUrl: "https://www.youtube.com/watch?v=AYNvbkN1gvA",
    image: "https://i.ytimg.com/vi/AYNvbkN1gvA/hqdefault.jpg",
    ingredients: [
      ["chicken breast", 5, "oz", "meat"],
      ["large tortilla", 1, "each", "bakery"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["mozzarella cheese", 0.25, "cup", "dairy"],
      ["tomato", 0.5, "each", "produce"],
      ["romaine lettuce", 1, "cup", "produce"]
    ]
  },
  {
    id: "youtube-lunch-uGMEn_8T__M",
    meal: "Lunch",
    title: "Chicken Quinoa Buddha Bowl",
    summary: "Chicken and quinoa bowls topped with carrots, tomatoes, red onion, and greens.",
    cost: 4.5,
    minutes: 25,
    protein: 41,
    tags: ["balanced", "high-protein", "gluten-free", "batch", "leftovers"],
    provider: "YouTube + AI",
    source: "Food and Health Communications",
    sourceUrl: "https://www.youtube.com/watch?v=uGMEn_8T__M",
    image: "https://i.ytimg.com/vi/uGMEn_8T__M/hqdefault.jpg",
    ingredients: [
      ["chicken breast", 5, "oz", "meat"],
      ["cooked quinoa", 0.75, "cup", "pantry"],
      ["carrot", 0.5, "each", "produce"],
      ["tomatoes", 0.5, "cup", "produce"],
      ["red onion", 0.25, "each", "produce"],
      ["mixed greens", 1, "cup", "produce"]
    ]
  },
  {
    id: "youtube-dinner-JE5pGflwcLg",
    meal: "Dinner",
    title: "Shipwreck Ground Beef Skillet",
    summary: "A one-pan ground beef skillet with pasta, peas, corn, and melted cheese.",
    cost: 4.25,
    minutes: 30,
    protein: 34,
    tags: ["balanced", "high-protein", "batch", "family", "leftovers"],
    provider: "YouTube + AI",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=JE5pGflwcLg",
    image: "https://i.ytimg.com/vi/JE5pGflwcLg/hqdefault.jpg",
    ingredients: [
      ["lean ground beef", 5, "oz", "meat"],
      ["pasta", 2, "oz", "pantry"],
      ["peas", 0.25, "cup", "frozen"],
      ["corn", 0.25, "cup", "frozen"],
      ["cheddar cheese", 0.25, "cup", "dairy"],
      ["tomato sauce", 0.5, "cup", "pantry"]
    ]
  },
  {
    id: "youtube-dinner-pjWjLkQmCTw",
    meal: "Dinner",
    title: "Stuffed Pepper Skillet",
    summary: "An unstuffed pepper skillet with ground beef, cauliflower rice, vegetables, and cheese.",
    cost: 4.5,
    minutes: 30,
    protein: 36,
    tags: ["balanced", "high-protein", "gluten-free", "batch", "family", "leftovers"],
    provider: "YouTube + AI",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=pjWjLkQmCTw",
    image: "https://i.ytimg.com/vi/pjWjLkQmCTw/hqdefault.jpg",
    ingredients: [
      ["lean ground beef", 5, "oz", "meat"],
      ["bell pepper", 1, "each", "produce"],
      ["cauliflower rice", 1, "cup", "frozen"],
      ["diced tomatoes", 0.5, "cup", "pantry"],
      ["onion", 0.25, "each", "produce"],
      ["cheddar cheese", 0.25, "cup", "dairy"]
    ]
  }
];

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

async function handleRequest(req, res) {
  const requestStartedAt = Date.now();
  const requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", requestId);
  res.on("finish", () => {
    console.log(JSON.stringify({
      level: "info",
      event: "request",
      requestId,
      method: req.method,
      path: String(req.url || "").split("?")[0],
      status: res.statusCode,
      durationMs: Date.now() - requestStartedAt,
      client: clientFingerprint(req)
    }));
  });

  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    setSecurityHeaders(res);

    if (requestUrl.pathname.startsWith("/api/") && !allowRequest(req, res)) {
      return;
    }

    if (requestUrl.pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        services: {
          convex: Boolean(process.env.CONVEX_URL),
          openai: Boolean(process.env.OPENAI_API_KEY),
          rapidapi: Boolean(process.env.RAPIDAPI_KEY),
          stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
          youtube: Boolean(process.env.YOUTUBE_API_KEY)
        }
      });
      return;
    }

    if (requestUrl.pathname === "/api/config") {
      sendJson(res, 200, {
        convexUrl: process.env.CONVEX_URL || "",
        environment: process.env.APP_ENV || "production",
        posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
        posthogKey: process.env.POSTHOG_KEY || "",
        release: process.env.VERCEL_GIT_COMMIT_SHA || "",
        sentryDsn: process.env.SENTRY_DSN || "",
        sentryTracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
        billingConfigured: Boolean(
          process.env.STRIPE_SECRET_KEY &&
          process.env.STRIPE_MONTHLY_PRICE_ID &&
          process.env.STRIPE_YEARLY_PRICE_ID
        )
      });
      return;
    }

    if (requestUrl.pathname === "/api/billing/checkout") {
      await handleStripeCheckoutRequest(req, res, requestUrl);
      return;
    }

    if (requestUrl.pathname === "/api/billing/portal") {
      await handleStripePortalRequest(req, res, requestUrl);
      return;
    }

    if (requestUrl.pathname === "/api/billing/webhook") {
      await handleStripeWebhookRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/account/delete") {
      await handleAccountDeletionRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/usage/consume") {
      await handleUsageConsumeRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/app-store/notifications") {
      try {
        await handleAppStoreNotificationRequest(req, res);
      } catch (error) {
        if (!error.statusCode) reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, error.statusCode || 500, { error: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/recipes") {
      try {
        await handleRecipeRequest(requestUrl, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 200, []);
      }
      return;
    }

    if (requestUrl.pathname === "/api/ingredients/normalize") {
      try {
        await handleIngredientRequest(req, res);
      } catch (error) {
        if (!error.statusCode || error.statusCode >= 500) {
          reportServerError(error, requestUrl.pathname, requestId);
        }
        sendJson(
          res,
          error.statusCode || 502,
          { error: error.statusCode ? error.message : "Ingredient provider request failed" }
        );
      }
      return;
    }

    if (requestUrl.pathname === "/api/ai/prep-tips") {
      try {
        await handlePrepTipsRequest(req, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 502, { error: "OpenAI prep helper failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/ai/meal-instructions") {
      try {
        await handleMealInstructionsRequest(req, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 502, { error: "OpenAI meal instructions failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/instacart/products") {
      try {
        await handleInstacartProductsRequest(requestUrl, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 502, { error: "Instacart provider request failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/instacart/product") {
      try {
        await handleInstacartProductRequest(req, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 502, { error: "Instacart product request failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/stores") {
      try {
        await handleStoresRequest(requestUrl, res);
      } catch (error) {
        reportServerError(error, requestUrl.pathname, requestId);
        sendJson(res, 200, fallbackStorePayload(requestUrl));
      }
      return;
    }

    serveStatic(requestUrl.pathname, res);
  } catch (error) {
    reportServerError(error, String(req.url || "").split("?")[0], requestId, req.method);
    const statusCode = error.statusCode || (/auth|identity|token/i.test(error.message) ? 401 : 500);
    sendJson(res, statusCode, {
      error: statusCode >= 500 ? "Unexpected server error" : error.message
    });
  }
}

if (require.main === module) {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`PrepWise running at http://localhost:${PORT}`);
  });
}

module.exports = handleRequest;

function reportServerError(error, route, requestId, method) {
  console.error(error);
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureException(error, {
    tags: {
      method: method || "unknown",
      route,
    },
    extra: { requestId },
  });
}

function loadLocalEnv() {
  [".env.local", ".env"].forEach((filename) => {
    const envPath = path.join(ROOT, filename);
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) return;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  });
}

async function handleRecipeRequest(requestUrl, res) {
  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 200, [], "public, s-maxage=3600");
    return;
  }

  const preference = normalizePreference(requestUrl.searchParams.get("preference"));
  const recipes = await fetchMealPrepRecipes(preference);
  sendJson(res, 200, recipes, "public, s-maxage=3600");
}

async function handleStripeCheckoutRequest(req, res, requestUrl) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  requireBillingConfiguration();
  const body = await readJsonBody(req);
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  const priceId = plan === "yearly"
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;
  const convex = authenticatedConvexClient(req);
  const identity = await convex.query(anyApi.app.billingIdentity, {});
  const stripe = stripeClient();
  let customerId = identity.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: identity.email || undefined,
      metadata: { convexUserId: String(identity.userId) }
    });
    customerId = customer.id;
    await convex.mutation(anyApi.app.setStripeCustomer, { stripeCustomerId: customerId });
  }

  const origin = publicAppOrigin(requestUrl);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: String(identity.userId),
    subscription_data: plan === "monthly" ? { trial_period_days: 7 } : undefined,
    success_url: `${origin}/?billing=success`,
    cancel_url: `${origin}/?billing=cancelled`
  });
  sendJson(res, 200, { url: session.url });
}

async function handleStripePortalRequest(req, res, requestUrl) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  requireBillingConfiguration();
  const convex = authenticatedConvexClient(req);
  const identity = await convex.query(anyApi.app.billingIdentity, {});
  if (!identity.stripeCustomerId) {
    sendJson(res, 409, { error: "No Stripe subscription is linked to this account" });
    return;
  }
  const session = await stripeClient().billingPortal.sessions.create({
    customer: identity.stripeCustomerId,
    return_url: `${publicAppOrigin(requestUrl)}/?billing=portal-return`
  });
  sendJson(res, 200, { url: session.url });
}

async function handleStripeWebhookRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  requireBillingConfiguration();
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    sendJson(res, 400, { error: "Missing Stripe signature" });
    return;
  }
  const rawBody = await readRawBody(req);
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    sendJson(res, 400, { error: "Invalid Stripe webhook signature" });
    return;
  }

  if (event.type.startsWith("customer.subscription.")) {
    await syncStripeSubscription(event, event.data.object);
  } else if (event.type === "checkout.session.completed" && event.data.object.subscription) {
    const subscription = await stripeClient().subscriptions.retrieve(event.data.object.subscription);
    await syncStripeSubscription(event, subscription);
  }
  sendJson(res, 200, { received: true });
}

async function syncStripeSubscription(event, subscription) {
  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
  const firstItem = subscription.items?.data?.[0];
  const currentPeriodEnd = subscription.current_period_end || firstItem?.current_period_end;
  await systemConvexClient().mutation(anyApi.billing.applyStripeEvent, {
    syncSecret: process.env.STRIPE_SYNC_SECRET,
    eventId: event.id,
    eventType: event.type,
    customerId,
    subscriptionId: subscription.id,
    priceId: firstItem?.price?.id,
    status: subscription.status,
    currentPeriodEnd: currentPeriodEnd
      ? currentPeriodEnd * 1000
      : undefined,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end || subscription.cancel_at)
  });
}

async function handleAccountDeletionRequest(req, res) {
  if (req.method !== "DELETE") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  const convex = authenticatedConvexClient(req);
  const identity = await convex.query(anyApi.app.billingIdentity, {});
  if (identity.stripeCustomerId && process.env.STRIPE_SECRET_KEY) {
    await stripeClient().customers.del(identity.stripeCustomerId);
  }
  await convex.mutation(anyApi.app.deleteMyAccount, {});
  sendJson(res, 200, { deleted: true });
}

async function handleUsageConsumeRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  const body = await readJsonBody(req);
  if (!["plans", "swaps", "ai"].includes(body.feature)) {
    sendJson(res, 400, { error: "Unknown usage feature" });
    return;
  }
  const result = await authenticatedConvexClient(req)
    .mutation(anyApi.app.consumeFeature, { feature: body.feature });
  sendJson(res, result.allowed ? 200 : 402, result);
}

async function handleAppStoreNotificationRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const result = await processSignedNotification(body.signedPayload, null);
  sendJson(res, 200, result);
}

async function handleIngredientRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const ingredients = Array.isArray(body.ingredients)
    ? body.ingredients
      .slice(0, 12)
      .map((ingredient) => ({ name: String(ingredient?.name || "").trim().slice(0, 100) }))
      .filter((ingredient) => ingredient.name)
    : [];

  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 200, fallbackIngredients(ingredients));
    return;
  }

  const normalized = [];

  for (const ingredient of ingredients) {
    normalized.push(await normalizeIngredient(ingredient));
    await wait(250);
  }

  sendJson(res, 200, normalized);
}

async function handlePrepTipsRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const meals = Array.isArray(body.meals) ? body.meals.slice(0, 3) : [];
  const prefs = body.preferences || {};

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 200, fallbackPrepTips(meals, prefs));
    return;
  }

  try {
    const response = await openAiPost("/v1/responses", {
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "You help busy people meal prep. Return only compact JSON with keys prepOrder, timeSavers, substitutions. Each value must be an array of concise strings. Keep advice practical and under 30-minute prep constraints."
        },
        {
          role: "user",
          content: JSON.stringify({
            preferences: prefs,
            meals: meals.map((meal) => ({
              meal: meal.meal,
              title: meal.title,
              minutes: meal.minutes,
              ingredients: meal.ingredients
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const text = extractOpenAiText(response);
    sendJson(res, 200, JSON.parse(text));
  } catch (error) {
    console.error(error);
    sendJson(res, 200, fallbackPrepTips(meals, prefs));
  }
}

async function handleMealInstructionsRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const meals = Array.isArray(body.meals) ? body.meals.slice(0, 3) : [];
  const prefs = body.preferences || {};

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 200, fallbackMealInstructions(meals, prefs));
    return;
  }

  try {
    const response = await openAiPost("/v1/responses", {
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "Create concise, practical recipe instructions for bulk meal prep. Return only compact JSON with key mealInstructions. mealInstructions must be an array. Each item must include id, title, instructions, storage, and reheating. instructions must be 4 to 6 short ordered steps. storage and reheating must be one short sentence each. Keep steps realistic for home cooks and under the meal's stated prep time."
        },
        {
          role: "user",
          content: JSON.stringify({
            preferences: prefs,
            meals: meals.map((meal) => ({
              id: meal.id,
              meal: meal.meal,
              title: meal.title,
              summary: meal.summary,
              minutes: meal.minutes,
              servings: meal.servings,
              ingredients: meal.ingredients
            }))
          })
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      }
    });

    const text = extractOpenAiText(response);
    sendJson(res, 200, JSON.parse(text));
  } catch (error) {
    console.error(error);
    sendJson(res, 200, fallbackMealInstructions(meals, prefs));
  }
}

async function handleInstacartProductsRequest(requestUrl, res) {
  if (process.env.ENABLE_INSTACART_SCRAPER !== "true") {
    sendJson(res, 403, { error: "Instacart scraper integration is disabled pending commercial approval" });
    return;
  }
  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 200, []);
    return;
  }

  const url =
    requestUrl.searchParams.get("url") ||
    "https://www.instacart.com/categories/316-food/627-frozen-food?page=2";

  if (!url.startsWith("https://www.instacart.com/")) {
    sendJson(res, 400, { error: "Instacart URL must start with https://www.instacart.com/" });
    return;
  }

  if (instacartCache.has(url)) {
    sendJson(res, 200, instacartCache.get(url));
    return;
  }

  const response = await rapidApiPostToHost(
    INSTACART_RAPIDAPI_HOST,
    "/scrapers/api/instacart/product/listing-by-url",
    { url },
    55000
  );
  const products = (response.data || []).slice(0, 12).map(normalizeInstacartProduct);

  instacartCache.set(url, products);
  sendJson(res, 200, products);
}

async function handleInstacartProductRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  if (process.env.ENABLE_INSTACART_SCRAPER !== "true") {
    sendJson(res, 403, { error: "Instacart scraper integration is disabled pending commercial approval" });
    return;
  }

  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 500, { error: "Missing RAPIDAPI_KEY" });
    return;
  }

  const body = await readJsonBody(req);
  const url = String(body.url || "").trim();

  if (!url.startsWith("https://www.instacart.com/products/")) {
    sendJson(res, 400, { error: "Instacart product URL must start with https://www.instacart.com/products/" });
    return;
  }

  if (instacartProductCache.has(url)) {
    sendJson(res, 200, instacartProductCache.get(url));
    return;
  }

  const response = await rapidApiPostToHost(
    INSTACART_RAPIDAPI_HOST,
    "/scrapers/api/instacart/product/get-by-url",
    { url },
    55000
  );
  const product = normalizeInstacartProductDetail(unwrapInstacartProduct(response), url);

  instacartProductCache.set(url, product);
  sendJson(res, 200, product);
}

async function handleStoresRequest(requestUrl, res) {
  const zip = String(requestUrl.searchParams.get("zip") || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    sendJson(res, 400, { error: "ZIP must be a 5-digit US ZIP code" });
    return;
  }

  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 200, fallbackStorePayload(requestUrl));
    return;
  }

  if (storeCache.has(zip)) {
    sendJson(res, 200, storeCache.get(zip));
    return;
  }

  const geocode = await rapidApiGetFromHost(
    GOOGLE_PLACES_RAPIDAPI_HOST,
    `/maps/api/geocode/json?${new URLSearchParams({ address: zip, language: "en" })}`
  );
  const location = geocode.results?.[0]?.geometry?.location;

  if (geocode.status !== "OK" || !location) {
    sendJson(res, 404, { error: "ZIP code could not be geocoded" });
    return;
  }

  const nearby = await rapidApiPostToHost(
    GOOGLE_PLACES_NEW_RAPIDAPI_HOST,
    "/v1/places:searchNearby",
    {
      languageCode: "en",
      regionCode: "US",
      includedTypes: ["supermarket"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: location.lat,
            longitude: location.lng
          },
          radius: 8000
        }
      }
    },
    30000,
    {
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.types,places.primaryType"
    }
  );

  const stores = dedupeStoreBrands((nearby.places || [])
    .filter(isGroceryStore)
    .map((place, index) => normalizeStore(place, location, index)))
    .slice(0, 8);
  const payload = {
    zip,
    location: {
      lat: location.lat,
      lng: location.lng,
      label: geocode.results?.[0]?.formatted_address || zip
    },
    stores
  };

  storeCache.set(zip, payload);
  sendJson(res, 200, payload);
}

function fallbackIngredients(ingredients) {
  return ingredients.map((ingredient) => ({
    name: String(ingredient?.name || "").trim(),
    match: null
  }));
}

function fallbackPrepTips(meals) {
  const mealNames = meals.map((meal) => meal.title).filter(Boolean).slice(0, 3);
  const mealText = mealNames.length ? mealNames.join(", ") : "your selected meals";

  return {
    prepOrder: [
      "Cook grains and proteins first so they can cool before packing.",
      "Chop produce while pans or sheet trays are cooking.",
      "Portion sauces separately to keep meals fresh."
    ],
    timeSavers: [
      `Batch shared ingredients across ${mealText}.`,
      "Use frozen vegetables when prep time is tight.",
      "Pack lunches and dinners in labeled containers before cleanup."
    ],
    substitutions: [
      "Swap canned beans for cooked meat to lower cost.",
      "Use Greek yogurt in place of creamy dressings.",
      "Choose microwave rice or prewashed greens for faster assembly."
    ]
  };
}

function fallbackMealInstructions(meals) {
  return {
    mealInstructions: meals.map((meal) => ({
      id: meal.id,
      title: meal.title,
      instructions: [
        "Gather ingredients and storage containers before cooking.",
        "Cook the longest-running ingredient first.",
        "Prepare vegetables and sauce while the main ingredient cooks.",
        "Combine portions for each serving and let hot food cool briefly.",
        "Refrigerate sealed containers for the week."
      ],
      storage: "Store in airtight containers in the refrigerator.",
      reheating: "Reheat until hot, adding a splash of water or sauce if needed."
    }))
  };
}

function fallbackStorePayload(requestUrl) {
  const zip = String(requestUrl.searchParams.get("zip") || "").trim();

  return {
    zip,
    location: null,
    stores: []
  };
}

async function normalizeIngredient(ingredient) {
  const name = String(ingredient.name || "").trim();
  if (!name) return null;

  const cacheKey = name.toLowerCase();
  if (ingredientCache.has(cacheKey)) {
    return ingredientCache.get(cacheKey);
  }

  const response = await rapidApiGetFromHost(
    EDAMAM_RAPIDAPI_HOST,
    `/api/food-database/v2/parser?${new URLSearchParams({ ingr: name })}`
  );
  const parsed = response.parsed?.[0] || response.hints?.[0];
  const food = parsed?.food;

  if (!food) {
    const unmatched = { name, match: null };
    ingredientCache.set(cacheKey, unmatched);
    return unmatched;
  }

  const result = {
    name,
    match: food.label,
    foodId: food.foodId,
    nutrients: {
      calories: roundNutrient(food.nutrients?.ENERC_KCAL),
      protein: roundNutrient(food.nutrients?.PROCNT),
      fat: roundNutrient(food.nutrients?.FAT),
      carbs: roundNutrient(food.nutrients?.CHOCDF),
      fiber: roundNutrient(food.nutrients?.FIBTG)
    }
  };

  ingredientCache.set(cacheKey, result);
  return result;
}

async function fetchMealPrepRecipes(preference) {
  const providers = [fetchSpoonacularMealPrepRecipes(preference)];

  if (process.env.ENABLE_TASTY_PROVIDER === "true") {
    providers.push(fetchTastyMealPrepRecipes(preference));
  }

  if (process.env.OPENAI_API_KEY && process.env.YOUTUBE_API_KEY) {
    providers.push(fetchYoutubeMealPrepRecipes(preference));
  }

  const results = await Promise.allSettled(providers);

  const recipesByKey = new Map();
  const errors = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((recipe) => {
        recipesByKey.set(recipeDedupeKey(recipe), recipe);
      });
      return;
    }

    console.error(result.reason);
    errors.push(result.reason);
  });

  if (recipesByKey.size === 0 && errors.length) {
    throw errors[0];
  }

  return shuffle(removeAmbiguousRecipeImages([...recipesByKey.values()]));
}

async function fetchSpoonacularMealPrepRecipes(preference) {
  const mealRequests = [
    ["Breakfast", "breakfast"],
    ["Lunch", "main course"],
    ["Dinner", "main course"]
  ];
  const recipes = [];

  for (const [meal, type] of mealRequests) {
    const response = await rapidApiGet(
      `/recipes/complexSearch?${new URLSearchParams({
        type,
        number: "12",
        maxReadyTime: "30",
        sort: "random",
        instructionsRequired: "false",
        addRecipeInformation: "true",
        addRecipeNutrition: "true",
        ...preferenceSearchParams(preference)
      })}`
    );

    (response.results || [])
      .map((recipe) => normalizeRecipe(recipe, meal, preference))
      .filter((recipe) => recipe.minutes <= 30 && recipe.ingredients.length >= 3)
      .forEach((recipe) => recipes.push(recipe));

    await wait(850);
  }

  return recipes;
}

async function fetchTastyMealPrepRecipes(preference) {
  const mealRequests = [
    ["Breakfast", "breakfast"],
    ["Lunch", "lunch"],
    ["Dinner", "dinner"]
  ];
  const recipes = [];

  for (const [meal, tag] of mealRequests) {
    const tags = ["under_30_minutes", tag, ...tastyPreferenceTags(preference)];
    const response = await rapidApiGetFromHost(
      TASTY_RAPIDAPI_HOST,
      `/recipes/list?${new URLSearchParams({
        from: "0",
        size: "8",
        tags: tags.join(",")
      })}`
    );

    (response.results || [])
      .filter((recipe) => recipe.sections && recipe.name)
      .map((recipe) => normalizeTastyRecipe(recipe, meal, preference))
      .filter((recipe) => recipe.minutes <= 30 && recipe.ingredients.length >= 3)
      .forEach((recipe) => recipes.push(recipe));

    await wait(650);
  }

  return recipes;
}

async function fetchYoutubeMealPrepRecipes(preference) {
  const cacheKey = preference || "balanced";
  const cached = youtubeRecipeCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < 6 * 60 * 60 * 1000) {
    return cached.recipes;
  }

  try {
    const liveRecipes = await fetchLiveYoutubeMealPrepRecipes(preference);
    const recipes = ensureYoutubeRecipeInventory(liveRecipes);
    youtubeRecipeCache.set(cacheKey, { createdAt: Date.now(), recipes });
    return recipes;
  } catch (error) {
    console.error(error);
    const recipes = cached?.recipes?.length
      ? cached.recipes
      : ensureYoutubeRecipeInventory([]);
    youtubeRecipeCache.set(cacheKey, { createdAt: Date.now(), recipes });
    return recipes;
  }
}

async function fetchLiveYoutubeMealPrepRecipes(preference) {
  const mealSearches = [
    ["Breakfast", "breakfast recipe oatmeal eggs burrito"],
    ["Lunch", "lunch recipe bowl wrap salad"],
    ["Dinner", "dinner recipe one pan pasta skillet"]
  ];
  const searchCandidates = [];

  for (const [meal, query] of mealSearches) {
    const response = await youtubeApiGet(
      `/youtube/v3/search?${new URLSearchParams({
        part: "snippet",
        type: "video",
        q: `${query} ${youtubePreferenceQuery(preference)}`.trim(),
        maxResults: "10",
        videoEmbeddable: "true",
        videoSyndicated: "true",
        safeSearch: "moderate",
        regionCode: "US",
        relevanceLanguage: "en"
      })}`
    );

    (response.items || []).forEach((item) => {
      if (!item.id?.videoId || !item.snippet) return;
      searchCandidates.push({
        meal,
        videoId: item.id.videoId,
        title: decodeHtmlEntities(item.snippet.title),
        channel: decodeHtmlEntities(item.snippet.channelTitle || "YouTube creator"),
        image: officialYoutubeThumbnail(item.snippet.thumbnails),
        descriptionSnippet: decodeHtmlEntities(item.snippet.description || "")
      });
    });

    await wait(150);
  }

  const candidateIds = [...new Set(searchCandidates.map((video) => video.videoId))];
  if (candidateIds.length === 0) return [];

  const detailsResponse = await youtubeApiGet(
    `/youtube/v3/videos?${new URLSearchParams({
      part: "snippet,contentDetails,status",
      id: candidateIds.join(",")
    })}`
  );
  const detailsById = new Map((detailsResponse.items || []).map((item) => [item.id, item]));
  const detailedVideos = searchCandidates
    .map((video) => {
      const details = detailsById.get(video.videoId);
      if (!details?.status?.embeddable || details.status.uploadStatus !== "processed") return null;

      const durationMinutes = youtubeDurationMinutes(details.contentDetails?.duration);
      const candidate = {
        ...video,
        title: decodeHtmlEntities(details.snippet?.title || video.title),
        channel: decodeHtmlEntities(details.snippet?.channelTitle || video.channel),
        durationMinutes,
        description: decodeHtmlEntities(
          String(details.snippet?.description || video.descriptionSnippet)
        ).slice(0, 7000),
        image: officialYoutubeThumbnail(details.snippet?.thumbnails) || video.image
      };

      return durationMinutes <= 30 &&
        isSpecificYoutubeRecipeCandidate(candidate) &&
        (isYoutubeMealMatch(candidate, video.meal) || isLikelyYoutubeRecipeVideo(candidate))
        ? candidate
        : null;
    })
    .filter(Boolean)
    .filter((video, index, items) =>
      items.findIndex((candidate) => candidate.videoId === video.videoId) === index
    )
    .slice(0, 15);

  if (detailedVideos.length === 0) {
    return [];
  }

  const extractedRecipes = await extractYoutubeRecipes(detailedVideos, preference);
  return extractedRecipes;
}

async function extractYoutubeRecipes(videos, preference) {
  const response = await openAiPost("/v1/responses", {
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
    text: {
      format: {
        type: "json_schema",
        name: "youtube_meal_prep_recipes",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["recipes"],
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["videoId", "title", "summary", "minutes", "protein", "cost", "tags", "ingredients"],
                properties: {
                  videoId: { type: "string" },
                  title: { type: "string" },
                  summary: { type: "string" },
                  minutes: { type: "number" },
                  protein: { type: "number" },
                  cost: { type: "number" },
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["balanced", "high-protein", "vegetarian", "vegan", "gluten-free", "quick", "batch", "family", "leftovers"]
                    }
                  },
                  ingredients: {
                    type: "array",
                    minItems: 3,
                    maxItems: 10,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      required: ["name", "amount", "unit", "category"],
                      properties: {
                        name: { type: "string" },
                        amount: { type: "number" },
                        unit: { type: "string" },
                        category: {
                          type: "string",
                          enum: ["produce", "meat", "dairy", "bakery", "frozen", "refrigerated", "pantry"]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    input: [
      {
        role: "system",
        content:
          "Convert qualifying YouTube cooking videos into practical meal-prep recipes and return only compact JSON with key recipes. Include a video only when its title and description clearly identify one specific dish being cooked and provide enough evidence for its ingredients. Reject general meal-prep advice, meal plans, what-I-eat videos, compilations, roundups, samplers, multiple-recipe videos, and vague videos that do not identify one dish. It is valid to return fewer recipes than supplied videos or an empty recipes array. Never invent a dish or ingredients unrelated to the source. Each accepted recipe must include videoId, a specific dish title, summary, minutes, protein, cost, tags, and ingredients. Ingredients must be an array of objects with name, amount, unit, and category. Amounts must be realistic amounts per person for one serving. category must be produce, meat, dairy, bakery, frozen, refrigerated, or pantry. minutes must be 30 or less. cost is estimated US dollars per serving. tags may include balanced, high-protein, vegetarian, vegan, gluten-free, quick, batch, family, and leftovers."
      },
      {
        role: "user",
        content: JSON.stringify({
          dietaryPreference: preference,
          videos: videos.map((video) => ({
            meal: video.meal,
            videoId: video.videoId,
            sourceTitle: video.title,
            channel: video.channel,
            sourceDurationMinutes: video.durationMinutes,
            description: video.description
          }))
        })
      }
    ]
  });
  const parsed = JSON.parse(extractOpenAiText(response));
  const byVideoId = new Map(videos.map((video) => [video.videoId, video]));

  const recipesByVideo = new Map();

  (Array.isArray(parsed.recipes) ? parsed.recipes : []).forEach((recipe) => {
    if (recipesByVideo.has(recipe.videoId)) return;
    const normalized = normalizeYoutubeRecipe(recipe, byVideoId.get(recipe.videoId), preference);
    if (normalized) recipesByVideo.set(recipe.videoId, normalized);
  });

  return [...recipesByVideo.values()];
}

function normalizeYoutubeRecipe(recipe, video, preference) {
  if (!video || !Array.isArray(recipe.ingredients) || recipe.ingredients.length < 3) {
    return null;
  }

  const recipeTitle = String(recipe.title || "").trim();
  if (!isSpecificRecipeTitle(recipeTitle) || isGeneralYoutubeVideo(video)) {
    return null;
  }

  const minutes = Math.min(30, Math.max(1, Number(recipe.minutes) || video.durationMinutes));
  const ingredients = recipe.ingredients.slice(0, 10).map((ingredient) => {
    const name = String(ingredient.name || "ingredient").trim();
    const amount = Math.max(0.01, Number(ingredient.amount) || 1);
    const unit = String(ingredient.unit || "each").trim();
    const requestedCategory = String(ingredient.category || "").toLowerCase();
    const category = ["produce", "meat", "dairy", "bakery", "frozen", "refrigerated", "pantry"]
      .includes(requestedCategory)
      ? requestedCategory
      : inferCategory(name);
    return [name, amount, unit, category];
  });
  const tags = new Set(
    (Array.isArray(recipe.tags) ? recipe.tags : [])
      .map((tag) => String(tag).toLowerCase())
      .filter((tag) => ["balanced", "high-protein", "vegetarian", "vegan", "gluten-free", "quick", "batch", "family", "leftovers"].includes(tag))
  );

  tags.add("leftovers");
  if (minutes <= 20) tags.add("quick");
  if (preference !== "balanced") tags.add(preference);

  return {
    id: `youtube-${video.meal.toLowerCase()}-${video.videoId}`,
    meal: video.meal,
    title: recipeTitle.slice(0, 100),
    summary: String(
      recipe.summary
        ? `AI-generated from the creator's public video description. ${recipe.summary}`
        : `AI-generated from ${video.channel}'s public video description.`
    ).slice(0, 220),
    cost: Math.max(1.5, Math.min(15, Number(recipe.cost) || ingredients.length * 0.75)),
    minutes,
    protein: Math.max(0, Math.round(Number(recipe.protein) || 20)),
    tags: [...tags],
    provider: "YouTube + AI",
    source: video.channel,
    sourceUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
    image: video.image,
    ingredients
  };
}

function youtubePreferenceQuery(preference) {
  const queries = {
    balanced: "",
    "high-protein": "high protein",
    vegetarian: "vegetarian",
    vegan: "vegan",
    "gluten-free": "gluten free"
  };

  return queries[preference] || "";
}

function youtubeDurationMinutes(isoDuration) {
  const match = String(isoDuration || "").match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/
  );
  if (!match) return Number.POSITIVE_INFINITY;

  const days = Number(match[1] || 0);
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);
  const seconds = Number(match[4] || 0);
  return Math.max(1, Math.ceil(days * 1440 + hours * 60 + minutes + seconds / 60));
}

function officialYoutubeThumbnail(thumbnails = {}) {
  return thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    "";
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isYoutubeMealMatch(video, meal) {
  const text = `${video.title || ""} ${video.descriptionSnippet || ""}`.toLowerCase();
  const title = String(video.title || "").toLowerCase();
  const claimsLongRecipe =
    /\b(?:3[1-9]|[4-9]\d|[1-9]\d{2,})\s*[- ]?minutes?\b/.test(title) ||
    /\b[1-9]\s*[- ]?hours?\b/.test(title);
  const patterns = {
    Breakfast: /\b(breakfast|overnight oats?|oatmeal|egg|omelet|pancake|waffle|smoothie|chia pudding|breakfast burrito)\b/,
    Lunch: /\b(lunch|lunchbox|midday|meal prep|grain bowl|salad|wrap|sandwich)\b/,
    Dinner: /\b(dinner|supper|weeknight|one pot|sheet pan|skillet|casserole)\b/
  };

  return !claimsLongRecipe && (patterns[meal]?.test(text) || false);
}

function isSpecificYoutubeRecipeCandidate(video) {
  const text = `${video.title || ""} ${video.descriptionSnippet || ""}`.toLowerCase();
  return !isGeneralYoutubeVideo(video) &&
    /\b(recipe|oats?|oatmeal|eggs?|omelet|pancakes?|waffles?|smoothie|burrito|sandwich|wrap|salad|soup|chili|curry|chicken|turkey|beef|pork|salmon|shrimp|fish|pasta|noodles?|rice|quinoa|tacos?|pizza|casserole|stir[- ]?fry)\b/.test(text);
}

function isGeneralYoutubeVideo(video) {
  const title = String(video.title || "").toLowerCase();
  const titleNamesDish =
    /\b(oats?|oatmeal|eggs?|omelet|pancakes?|waffles?|smoothie|burrito|sandwich|wrap|salad|soup|chili|curry|chicken|turkey|beef|pork|salmon|shrimp|fish|pasta|noodles?|rice|quinoa|tacos?|pizza|casserole|stir[- ]?fry)\b/.test(title);

  return /\b(roundup|sampler|compilation|meal plan|meal ideas?|recipe ideas?|what i eat|full day of eating|week of meals?|weekly prep|cook with me|multiple recipes?|several recipes?|variety|variations?)\b/.test(title) ||
    /\b(recipes|meals|dinners|lunches|breakfasts)\b/.test(title) ||
    /\b(?:[2-9]|1\d+)\s+(?:easy |healthy |quick )?(?:meals?|recipes?|dinners?|lunches?|breakfasts?|ways)\b/.test(title) ||
    /\b(?:meals?|recipes?)\s+(?:for|in)\s+(?:the )?(?:week|month)\b/.test(title) ||
    (/\bmeal prep\b/.test(title) && !titleNamesDish);
}

function isSpecificRecipeTitle(title) {
  const value = String(title || "").trim().toLowerCase();
  if (value.length < 4 || isGeneralYoutubeVideo({ title: value })) {
    return false;
  }

  return !/^(meal prep|breakfast|lunch|dinner|healthy meal|easy meal|quick meal|high protein meal)(?: recipe)?$/.test(value);
}

function isLikelyYoutubeRecipeVideo(video) {
  const text = `${video.title || ""} ${video.descriptionSnippet || ""}`.toLowerCase();
  const title = String(video.title || "").toLowerCase();
  const claimsLongRecipe =
    /\b(?:3[1-9]|[4-9]\d|[1-9]\d{2,})\s*[- ]?minutes?\b/.test(title) ||
    /\b[1-9]\s*[- ]?hours?\b/.test(title);

  return !claimsLongRecipe &&
    /\b(recipe|meal prep|cook|breakfast|lunch|dinner|oats?|eggs?|chicken|beef|pasta|rice|salad|soup)\b/.test(text);
}

function mealsWithRecipeLimit(recipes, limit) {
  const counts = new Map();
  return recipes.filter((recipe) => {
    const count = counts.get(recipe.meal) || 0;
    if (count >= limit) return false;
    counts.set(recipe.meal, count + 1);
    return true;
  });
}

function ensureYoutubeRecipeInventory(recipes) {
  const seenIds = new Set();
  const combined = [...recipes, ...curatedYoutubeRecipes]
    .map((recipe) => ({
      ...recipe,
      summary: /^AI-generated from|^Curated from/i.test(recipe.summary)
        ? recipe.summary
        : `Curated from the linked creator video. ${recipe.summary}`
    }))
    .filter((recipe) => {
      if (seenIds.has(recipe.id)) return false;
      seenIds.add(recipe.id);
      return true;
    });

  return mealsWithRecipeLimit(combined, 2);
}

function bestThumbnail(thumbnails) {
  const items = Array.isArray(thumbnails) ? thumbnails : [];
  return items[items.length - 1]?.url || items[0]?.url || "";
}

function recipeDedupeKey(recipe) {
  return `${recipe.meal}:${recipe.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function removeAmbiguousRecipeImages(recipes) {
  const recipesByImage = new Map();

  recipes.forEach((recipe) => {
    const imageKey = normalizeImageUrl(recipe.image);
    if (!imageKey) return;
    const matches = recipesByImage.get(imageKey) || [];
    matches.push(recipe);
    recipesByImage.set(imageKey, matches);
  });

  return recipes.map((recipe) => {
    const imageKey = normalizeImageUrl(recipe.image);
    const imageMatches = imageKey ? recipesByImage.get(imageKey) || [] : [];
    const hasConflictingTitles = new Set(
      imageMatches.map((match) => String(match.title || "").trim().toLowerCase())
    ).size > 1;

    if (!isVerifiedRecipeImage(recipe) || hasConflictingTitles) {
      return { ...recipe, image: "" };
    }

    return recipe;
  });
}

function normalizeImageUrl(image) {
  try {
    const url = new URL(String(image || ""));
    url.search = "";
    url.hash = "";

    if (/buzzfeed\.com$/i.test(url.hostname)) {
      const fileName = url.pathname.split("/").filter(Boolean).pop();
      return `${url.hostname}/${fileName || ""}`.toLowerCase();
    }

    return url.toString().toLowerCase();
  } catch {
    return "";
  }
}

function isVerifiedRecipeImage(recipe) {
  const image = String(recipe.image || "");
  if (!/^https:\/\//i.test(image)) return false;

  if (recipe.provider === "Spoonacular") {
    const recipeId = String(recipe.id || "").split("-").pop();
    return new RegExp(`/recipes/${recipeId}(?:-|\\.)`, "i").test(image);
  }

  if (recipe.provider === "Tasty") {
    return /(?:buzzfeed\.com|tasty\.co)/i.test(image) &&
      !/\b(?:breakfasts|lunches|dinners|recipes|meals|ways)\b/i.test(
        decodeURIComponent(image)
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/[^a-z]+/gi, " ")
      );
  }

  return true;
}

function preferenceSearchParams(preference) {
  const params = {
    balanced: {},
    "high-protein": { minProtein: "25" },
    vegetarian: { diet: "vegetarian" },
    vegan: { diet: "vegan" },
    "gluten-free": { intolerances: "gluten" }
  };

  return params[preference] || {};
}

function tastyPreferenceTags(preference) {
  const tags = {
    balanced: [],
    "high-protein": ["high_protein"],
    vegetarian: ["vegetarian"],
    vegan: ["vegan"],
    "gluten-free": ["gluten_free"]
  };

  return tags[preference] || [];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function rapidApiGet(apiPath, retryCount = 0) {
  return rapidApiGetFromHost(RAPIDAPI_HOST, apiPath, retryCount);
}

function youtubeApiGet(apiPath) {
  if (!process.env.YOUTUBE_API_KEY) {
    return Promise.reject(new Error("Missing YOUTUBE_API_KEY"));
  }

  const separator = apiPath.includes("?") ? "&" : "?";
  const pathWithKey = `${apiPath}${separator}key=${encodeURIComponent(process.env.YOUTUBE_API_KEY)}`;
  const options = {
    method: "GET",
    hostname: "www.googleapis.com",
    path: pathWithKey,
    headers: {
      Accept: "application/json"
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      const chunks = [];
      apiRes.on("data", (chunk) => chunks.push(chunk));
      apiRes.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          reject(new Error(`YouTube Data API returned ${apiRes.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.setTimeout(15000, () => {
      req.destroy(new Error("YouTube Data API request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

function rapidApiGetFromHost(hostname, apiPath, retryCount = 0) {
  const options = {
    method: "GET",
    hostname,
    path: apiPath,
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": hostname,
      "Content-Type": "application/json"
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      const chunks = [];
      apiRes.on("data", (chunk) => chunks.push(chunk));
      apiRes.on("end", () => {
        const body = Buffer.concat(chunks).toString();

        if (apiRes.statusCode === 429 && retryCount < 1) {
          wait(1600)
            .then(() => rapidApiGetFromHost(hostname, apiPath, retryCount + 1))
            .then(resolve)
            .catch(reject);
          return;
        }

        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          reject(new Error(`${hostname} returned ${apiRes.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.setTimeout(30000, () => {
      req.destroy(new Error("RapidAPI request timed out"));
    });
    req.on("error", reject);
    req.end();
  });
}

function openAiPost(apiPath, payload) {
  const data = JSON.stringify(payload);
  const options = {
    method: "POST",
    hostname: "api.openai.com",
    path: apiPath,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      const chunks = [];
      apiRes.on("data", (chunk) => chunks.push(chunk));
      apiRes.on("end", () => {
        const body = Buffer.concat(chunks).toString();

        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          reject(new Error(`OpenAI returned ${apiRes.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.setTimeout(30000, () => {
      req.destroy(new Error("OpenAI request timed out"));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function rapidApiPostToHost(hostname, apiPath, payload, timeoutMs = 30000, extraHeaders = {}) {
  const data = JSON.stringify(payload);
  const options = {
    method: "POST",
    hostname,
    path: apiPath,
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": hostname,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
      ...extraHeaders
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (apiRes) => {
      const chunks = [];
      apiRes.on("data", (chunk) => chunks.push(chunk));
      apiRes.on("end", () => {
        const body = Buffer.concat(chunks).toString();

        if (apiRes.statusCode < 200 || apiRes.statusCode >= 300) {
          reject(new Error(`RapidAPI returned ${apiRes.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("RapidAPI request timed out"));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function normalizeInstacartProduct(product) {
  return {
    id: product.id,
    name: product.name,
    size: product.size,
    url: product.url,
    image: instacartImageUrl(product),
    price: instacartPrice(product)
  };
}

function normalizeInstacartProductDetail(product, url) {
  return {
    brand: product.brand_name || "",
    name: product.name || "Instacart product",
    size: product.size || "",
    url,
    image: instacartImageUrl(product),
    price: instacartPrice(product),
    category: product.product_category_name || "",
    productInfo: product.product_info || "",
    nutrition: product.nutrition_info || null
  };
}

function unwrapInstacartProduct(response) {
  let product = response?.data || response;

  if (Array.isArray(product)) {
    product = product[0] || {};
  }

  if (product?.data) {
    product = Array.isArray(product.data) ? product.data[0] : product.data;
  }

  if (product?.product) {
    product = product.product;
  }

  return product || {};
}

function instacartImageUrl(product) {
  const templateUrl =
    product.image?.view_section?.product_image?.template_url ||
    product.image?.view_section?.retailer_product_image?.template_url ||
    product.image?.template_url ||
    "";
  if (templateUrl) {
    return templateUrl.replace("{width=}x{height=}", "240x240");
  }

  const imageUrl =
    product.image?.view_section?.product_image?.url ||
    product.image?.view_section?.retailer_product_image?.url ||
    "";
  if (imageUrl) {
    return imageUrl;
  }

  if (typeof product.image === "string") {
    return product.image;
  }

  const images = Array.isArray(product.images) ? product.images : product.images?.images || [];
  const image = images[0];
  const nestedTemplate = image?.view_section?.retailer_product_image?.template_url || image?.template_url || "";
  if (nestedTemplate) {
    return nestedTemplate.replace("{width=}x{height=}", "240x240");
  }

  return image?.url || image?.view_section?.retailer_product_image?.url || "";
}

function instacartPrice(product) {
  const priceInfo = product.price_info || product.pricing || {};
  const candidates = [
    priceInfo.price,
    priceInfo.item_price,
    priceInfo.current_price,
    priceInfo.price_string,
    priceInfo.display_price,
    product.price
  ];
  const value = candidates.find((candidate) => candidate !== undefined && candidate !== null && candidate !== "");

  return value === undefined ? "" : String(value);
}

function normalizeStore(place, origin, index) {
  const name = place.displayName?.text || place.name || "Nearby grocery store";
  const location = place.geometry?.location || place.location || {};
  const latitude = location.lat ?? location.latitude;
  const longitude = location.lng ?? location.longitude;
  const miles = distanceMiles(origin.lat, origin.lng, latitude, longitude);
  const address = [
    place.formattedAddress,
    place.formatted_address,
    place.vicinity,
    place.shortFormattedAddress,
    place.address,
    Array.isArray(place.addressComponents)
      ? place.addressComponents.map((component) => component.longText || component.long_name).filter(Boolean).join(", ")
      : ""
  ].find(Boolean) || "";

  return {
    id: place.place_id || place.id || `store-${index}`,
    name,
    address,
    distance: miles === null ? "" : `${miles.toFixed(1)} mi`,
    distanceMiles: miles,
    rating: typeof place.rating === "number" ? place.rating : null,
    ratingsTotal: place.user_ratings_total || place.userRatingCount || 0,
    openNow: place.opening_hours?.open_now ?? place.currentOpeningHours?.openNow ?? null,
    multiplier: estimateStoreMultiplier(name, index),
    coverage: "Google Places store location only, price estimate"
  };
}

function dedupeStoreBrands(stores) {
  const byBrand = new Map();

  stores.forEach((store) => {
    const brand = canonicalStoreBrand(store.name);
    const existing = byBrand.get(brand);

    if (!existing || compareStoreLocations(store, existing) < 0) {
      byBrand.set(brand, store);
    }
  });

  return Array.from(byBrand.values()).sort(compareStoreLocations);
}

function compareStoreLocations(a, b) {
  const distanceA = typeof a.distanceMiles === "number" ? a.distanceMiles : Number.POSITIVE_INFINITY;
  const distanceB = typeof b.distanceMiles === "number" ? b.distanceMiles : Number.POSITIVE_INFINITY;

  if (distanceA !== distanceB) return distanceA - distanceB;
  return (b.rating || 0) - (a.rating || 0);
}

function canonicalStoreBrand(name) {
  const lower = String(name || "").toLowerCase();

  if (lower.includes("aldi")) return "aldi";
  if (lower.includes("trader joe")) return "trader joes";
  if (lower.includes("whole foods")) return "whole foods";
  if (lower.includes("jewel")) return "jewel osco";
  if (lower.includes("mariano")) return "marianos";
  if (lower.includes("kroger")) return "kroger";
  if (lower.includes("walmart")) return "walmart";
  if (lower.includes("target")) return "target";
  if (lower.includes("costco")) return "costco";
  if (lower.includes("sam's club") || lower.includes("sams club")) return "sams club";

  return lower
    .replace(/&/g, " and ")
    .replace(/\b(the|market|supermarket|grocery|grocer|store|stores|food|foods)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isGroceryStore(place) {
  const types = Array.isArray(place.types) ? place.types : [];
  const typeSet = new Set(types);
  const name = String(place.displayName?.text || place.name || "").toLowerCase();
  const excludedNamePattern =
    /\b(7-eleven|bp|casey's|chevron|circle k|citgo|conoco|exxon|flying j|kum\s*&?\s*go|love's|marathon|mobil|pilot|quiktrip|shell|sheetz|speedway|sunoco|texaco|thorntons|valero|wawa)\b/;

  if (typeSet.has("gas_station") || excludedNamePattern.test(name)) {
    return false;
  }

  if (typeSet.has("convenience_store") && !typeSet.has("supermarket")) {
    return false;
  }

  return typeSet.has("supermarket") || typeSet.has("grocery_store") || typeSet.has("grocery_or_supermarket");
}

function estimateStoreMultiplier(name, index) {
  const lower = name.toLowerCase();
  if (lower.includes("aldi")) return 0.9;
  if (lower.includes("trader joe")) return 0.96;
  if (lower.includes("walmart")) return 0.94;
  if (lower.includes("target")) return 1.05;
  if (lower.includes("whole foods")) return 1.22;
  if (lower.includes("jewel") || lower.includes("kroger") || lower.includes("mariano")) return 0.99;
  return 1 + Math.min(index, 5) * 0.03;
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  if (![lat1, lng1, lat2, lng2].every((value) => typeof value === "number")) return null;

  const toRadians = (degrees) => degrees * Math.PI / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractOpenAiText(response) {
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }

  throw new Error("OpenAI response did not include output text");
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roundNutrient(value) {
  if (typeof value !== "number") return null;
  return Math.round(value * 10) / 10;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let rejected = false;
    req.on("data", (chunk) => {
      if (rejected) return;
      size += chunk.length;
      if (size > MAX_JSON_BODY_BYTES) {
        rejected = true;
        reject(Object.assign(new Error("Request body is too large"), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (rejected) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}"));
      } catch (error) {
        reject(Object.assign(new Error("Request body must be valid JSON"), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let totalBytes = 0;
    const chunks = [];

    req.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_JSON_BODY_BYTES) {
        const error = new Error("Request body is too large");
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function normalizeRecipe(recipe, meal, preference) {
  const nutrients = recipe.nutrition?.nutrients || [];
  const protein = Math.round(findNutrient(nutrients, "Protein") || 20);
  const cost = Math.max(1.5, Math.round((recipe.pricePerServing || 350) / 100));
  const tags = buildTags(recipe, preference);
  const ingredientSource = recipe.extendedIngredients || recipe.nutrition?.ingredients || [];
  const ingredients = ingredientSource.slice(0, 6).map((ingredient) => [
    ingredient.nameClean || ingredient.name,
    Number(ingredient.amount || 1),
    ingredient.unit || "each",
    normalizeAisle(ingredient.aisle)
  ]);

  return {
    id: `spoonacular-${meal.toLowerCase()}-${recipe.id}`,
    meal,
    title: recipe.title,
    summary: stripHtml(recipe.summary || `Recipe from ${recipe.sourceName || "Spoonacular"}`).slice(0, 150),
    cost,
    minutes: recipe.readyInMinutes || 30,
    protein,
    tags,
    provider: "Spoonacular",
    source: recipe.sourceName || "Spoonacular",
    image: recipe.image,
    ingredients
  };
}

function normalizeTastyRecipe(recipe, meal, preference) {
  const ingredients = (recipe.sections || [])
    .flatMap((section) => section.components || [])
    .slice(0, 6)
    .map((component) => [
      component.ingredient?.name || component.raw_text || "ingredient",
      1,
      "item",
      inferCategory(component.ingredient?.name || component.raw_text || "")
    ]);
  const tagNames = (recipe.tags || []).map((tag) => tag.name);
  const minutes = recipe.total_time_minutes || recipe.cook_time_minutes || recipe.prep_time_minutes || 30;
  const protein = tagNames.includes("high_protein") ? 32 : 22;

  return {
    id: `tasty-${meal.toLowerCase()}-${recipe.id}`,
    meal,
    title: recipe.name,
    summary: (recipe.description || `Recipe from Tasty`).slice(0, 150),
    cost: estimateTastyCost(tagNames, ingredients.length),
    minutes,
    protein,
    tags: buildTastyTags(tagNames, preference, minutes),
    provider: "Tasty",
    source: "Tasty",
    image: recipe.thumbnail_url,
    ingredients
  };
}

function buildTags(recipe, preference) {
  const tags = ["balanced", "leftovers"];

  if (recipe.vegetarian) tags.push("vegetarian");
  if (recipe.vegan) tags.push("vegan");
  if (recipe.glutenFree) tags.push("gluten-free");
  if (preference === "high-protein") tags.push("high-protein");
  if (recipe.readyInMinutes && recipe.readyInMinutes <= 20) tags.push("quick");

  return [...new Set(tags)];
}

function buildTastyTags(tagNames, preference, minutes) {
  const tagSet = new Set(["balanced", "leftovers"]);

  if (minutes <= 20) tagSet.add("quick");
  if (tagNames.includes("high_protein") || preference === "high-protein") tagSet.add("high-protein");
  if (tagNames.includes("vegetarian")) tagSet.add("vegetarian");
  if (tagNames.includes("vegan")) {
    tagSet.add("vegan");
    tagSet.add("vegetarian");
  }
  if (tagNames.includes("gluten_free")) tagSet.add("gluten-free");

  return [...tagSet];
}

function estimateTastyCost(tagNames, ingredientCount) {
  let cost = Math.max(2, ingredientCount * 0.75);

  if (tagNames.includes("budget")) cost -= 0.5;
  if (tagNames.includes("seafood") || tagNames.includes("steak")) cost += 1.5;
  if (tagNames.includes("vegan") || tagNames.includes("vegetarian")) cost -= 0.4;

  return Math.round(Math.max(1.75, cost) * 100) / 100;
}

function findNutrient(nutrients, name) {
  return nutrients.find((nutrient) => nutrient.name === name)?.amount;
}

function normalizeAisle(aisle = "") {
  const value = aisle.toLowerCase();
  if (value.includes("produce")) return "produce";
  if (value.includes("meat") || value.includes("seafood")) return "meat";
  if (value.includes("milk") || value.includes("cheese") || value.includes("dairy")) return "dairy";
  if (value.includes("frozen")) return "frozen";
  if (value.includes("bakery") || value.includes("bread")) return "bakery";
  return "pantry";
}

function inferCategory(name = "") {
  const value = name.toLowerCase();
  if (/(apple|avocado|banana|berry|broccoli|carrot|celery|cilantro|cucumber|garlic|greens|lettuce|lime|onion|pepper|potato|spinach|tomato)/.test(value)) return "produce";
  if (/(beef|chicken|fish|pork|salmon|shrimp|steak|turkey)/.test(value)) return "meat";
  if (/(butter|cheese|cream|egg|milk|yogurt)/.test(value)) return "dairy";
  if (/(bread|bun|tortilla|wrap)/.test(value)) return "bakery";
  if (/(frozen)/.test(value)) return "frozen";
  return "pantry";
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function serveStatic(pathname, res) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const contentType = mimeTypes[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": filePath.endsWith(".html") ? "no-cache" : "public, max-age=3600"
    });
    res.end(data);
  });
}

function sendJson(res, statusCode, data, cacheControl = "no-store") {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cacheControl
  });
  res.end(JSON.stringify(data));
}

function normalizePreference(value) {
  const allowed = new Set(["balanced", "high-protein", "vegetarian", "vegan", "gluten-free"]);
  return allowed.has(value) ? value : "balanced";
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https://images.unsplash.com https://i.ytimg.com https:; connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud https://*.posthog.com https://*.i.posthog.com https://*.sentry.io; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
}

function allowRequest(req, res) {
  const now = Date.now();
  const clientId = clientFingerprint(req);
  const bucket = requestBuckets.get(clientId);

  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    requestBuckets.set(clientId, { count: 1, startedAt: now });
    return allowRouteRequest(req, res, clientId, now);
  }

  bucket.count += 1;
  if (bucket.count <= RATE_LIMIT_MAX_REQUESTS) {
    return allowRouteRequest(req, res, clientId, now);
  }

  res.setHeader("Retry-After", String(Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.startedAt)) / 1000)));
  sendJson(res, 429, { error: "Too many requests. Please wait and try again." });
  return false;
}

function allowRouteRequest(req, res, clientId, now) {
  const pathname = String(req.url || "").split("?")[0];
  const limits = {
    "/api/ai/prep-tips": 8,
    "/api/ai/meal-instructions": 8,
    "/api/billing/checkout": 5,
    "/api/ingredients/normalize": 20,
    "/api/recipes": 12,
    "/api/usage/consume": 30,
  };
  const maximum = limits[pathname];
  if (!maximum) return true;

  const key = `${clientId}:${pathname}`;
  const bucket = routeBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    routeBuckets.set(key, { count: 1, startedAt: now });
    return true;
  }
  bucket.count += 1;
  if (bucket.count <= maximum) return true;
  res.setHeader("Retry-After", String(Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.startedAt)) / 1000)));
  sendJson(res, 429, { error: "This feature is being used too quickly. Please wait and try again." });
  return false;
}

function clientFingerprint(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const address = forwarded || req.socket?.remoteAddress || "unknown";
  const salt = process.env.RATE_LIMIT_SALT || "prepwise-local";
  return crypto.createHash("sha256").update(`${salt}:${address}`).digest("hex").slice(0, 16);
}

function bearerToken(req) {
  const authorization = String(req.headers.authorization || "");
  if (!authorization.startsWith("Bearer ")) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }
  return authorization.slice(7).trim();
}

function authenticatedConvexClient(req) {
  if (!process.env.CONVEX_URL) {
    const error = new Error("Convex is not configured");
    error.statusCode = 503;
    throw error;
  }
  const client = new ConvexHttpClient(process.env.CONVEX_URL);
  const token = bearerToken(req);
  client.setAuth(token);
  return client;
}

function systemConvexClient() {
  if (!process.env.CONVEX_URL || !process.env.STRIPE_SYNC_SECRET) {
    const error = new Error("Convex billing synchronization is not configured");
    error.statusCode = 503;
    throw error;
  }
  return new ConvexHttpClient(process.env.CONVEX_URL);
}

function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const error = new Error("Stripe is not configured");
    error.statusCode = 503;
    throw error;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    maxNetworkRetries: 2,
    timeout: 15000,
  });
}

function requireBillingConfiguration() {
  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_MONTHLY_PRICE_ID",
    "STRIPE_YEARLY_PRICE_ID",
    "STRIPE_SYNC_SECRET",
    "CONVEX_URL",
  ];
  if (required.some((name) => !process.env[name])) {
    const error = new Error("Billing is not fully configured");
    error.statusCode = 503;
    throw error;
  }
}

function publicAppOrigin(requestUrl) {
  const configured = String(process.env.APP_URL || "").replace(/\/+$/, "");
  if (configured) return configured;
  return requestUrl.origin;
}

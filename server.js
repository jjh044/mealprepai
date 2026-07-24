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
const {
  Environment: AppleEnvironment,
  SignedDataVerifier
} = require("@apple/app-store-server-library");
const { processSignedNotification } = require("./app-store-notifications");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const PORT_FALLBACK_LIMIT = Number(process.env.PORT_FALLBACK_LIMIT || 10);
const ROOT = __dirname;
const MAX_JSON_BODY_BYTES = 64 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const requestBuckets = new Map();
const routeBuckets = new Map();
loadLocalEnv();

function envHost(name, fallback) {
  const raw = String(process.env[name] || "").trim();
  if (!raw) return fallback;
  return raw.replace(/^['"]+|['"]+$/g, "");
}

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
  envHost("RAPIDAPI_SPOONACULAR_HOST", "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com");
const EDAMAM_RAPIDAPI_HOST =
  envHost("RAPIDAPI_EDAMAM_HOST", "edamam-food-and-grocery-database.p.rapidapi.com");
const INSTACART_RAPIDAPI_HOST =
  envHost("RAPIDAPI_INSTACART_HOST", "instacart-api1.p.rapidapi.com");
const GOOGLE_PLACES_RAPIDAPI_HOST =
  envHost("RAPIDAPI_GOOGLE_PLACES_HOST", "google-map-places.p.rapidapi.com");
const GOOGLE_PLACES_NEW_RAPIDAPI_HOST =
  envHost("RAPIDAPI_GOOGLE_PLACES_NEW_HOST", "google-map-places-new-v2.p.rapidapi.com");
const TASTY_RAPIDAPI_HOST =
  envHost("RAPIDAPI_TASTY_HOST", "tasty.p.rapidapi.com");
const ingredientCache = new Map();
const instacartCache = new Map();
const instacartProductCache = new Map();
const storeCache = new Map();
const youtubeRecipeCache = new Map();
const YOUTUBE_VIDEOS_PER_CHANNEL_PER_MEAL = 2;
const YOUTUBE_VIDEOS_PER_MEAL = 24;
const YOUTUBE_RECIPES_PER_MEAL = 30;
const YOUTUBE_EXTRACTION_BATCH_SIZE = 18;
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
    tags: ["balanced", "high-protein", "high-protein-low-carb", "vegetarian", "gluten-free", "quick", "batch"],
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
    title: "Chicken Cauliflower Rice Bowl",
    summary: "Chicken and cauliflower rice bowls topped with carrots, tomatoes, red onion, and greens.",
    cost: 4.5,
    minutes: 25,
    protein: 41,
    tags: ["balanced", "high-protein", "high-protein-low-carb", "gluten-free", "batch", "leftovers"],
    provider: "YouTube + AI",
    source: "Food and Health Communications",
    sourceUrl: "https://www.youtube.com/watch?v=uGMEn_8T__M",
    image: "https://i.ytimg.com/vi/uGMEn_8T__M/hqdefault.jpg",
    ingredients: [
      ["chicken breast", 5, "oz", "meat"],
      ["cauliflower rice", 1, "cup", "frozen"],
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
    tags: ["balanced", "high-protein", "high-protein-low-carb", "gluten-free", "batch", "family", "leftovers"],
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
  },
  {
    id: "youtube-breakfast-zrqvcsAAd50",
    meal: "Breakfast",
    title: "Berry Peanut Butter Oats",
    summary: "No-fuss oats with berries, peanut butter, and Greek yogurt.",
    cost: 2.1,
    minutes: 8,
    protein: 24,
    tags: ["quick", "family", "leftovers", "balanced", "vegetarian", "gluten-free"],
    provider: "YouTube + AI",
    source: "Ambitious Kitchen",
    sourceUrl: "https://www.youtube.com/watch?v=zrqvcsAAd50",
    image: "https://i.ytimg.com/vi/zrqvcsAAd50/hqdefault.jpg",
    ingredients: [
      ["rolled oats", 0.5, "cup", "pantry"],
      ["Greek yogurt", 0.5, "cup", "dairy"],
      ["frozen berries", 0.5, "cup", "frozen"],
      ["peanut butter", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "youtube-breakfast-dVH4kn7he7A",
    meal: "Breakfast",
    title: "Cottage Cheese Tomato Toast",
    summary: "Crisp toast with cottage cheese, tomatoes, pepper, and herbs.",
    cost: 2.35,
    minutes: 7,
    protein: 25,
    tags: ["quick", "vegetarian", "high-protein"],
    provider: "YouTube + AI",
    source: "Christine Pfeifer",
    sourceUrl: "https://www.youtube.com/watch?v=dVH4kn7he7A",
    image: "https://i.ytimg.com/vi/dVH4kn7he7A/hqdefault.jpg",
    ingredients: [
      ["whole grain bread", 2, "slices", "bakery"],
      ["cottage cheese", 0.5, "cup", "dairy"],
      ["tomatoes", 0.5, "cup", "produce"],
      ["everything seasoning", 1, "tsp", "pantry"]
    ]
  },
  {
    id: "youtube-breakfast-roDomVDBmGk",
    meal: "Breakfast",
    title: "Vegan Berry Chia Protein Pudding",
    summary: "Chia seeds, oat milk, berries, and plant protein prepped in jars.",
    cost: 2.65,
    minutes: 10,
    protein: 26,
    tags: ["quick", "balanced", "vegetarian", "vegan", "gluten-free", "leftovers", "high-protein"],
    provider: "YouTube + AI",
    source: "Carleigh Bodrug",
    sourceUrl: "https://www.youtube.com/watch?v=roDomVDBmGk",
    image: "https://i.ytimg.com/vi/roDomVDBmGk/hqdefault.jpg",
    ingredients: [
      ["chia seeds", 2, "tbsp", "pantry"],
      ["oat milk", 0.5, "cup", "refrigerated"],
      ["plant protein powder", 1, "scoop", "pantry"],
      ["frozen berries", 0.5, "cup", "frozen"]
    ]
  },
  {
    id: "youtube-lunch-msChF4tLnsI",
    meal: "Lunch",
    title: "Turkey Bean Chili",
    summary: "One-pot chili built for reheating all week.",
    cost: 3.95,
    minutes: 30,
    protein: 36,
    tags: ["batch", "family", "leftovers", "high-protein", "gluten-free", "balanced"],
    provider: "YouTube + AI",
    source: "Preppy Kitchen",
    sourceUrl: "https://www.youtube.com/watch?v=msChF4tLnsI",
    image: "https://i.ytimg.com/vi/msChF4tLnsI/hqdefault.jpg",
    ingredients: [
      ["ground turkey", 0.35, "lb", "meat"],
      ["black beans", 0.5, "can", "pantry"],
      ["diced tomatoes", 0.5, "can", "pantry"],
      ["frozen corn", 0.25, "cup", "frozen"],
      ["chili seasoning", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "youtube-lunch-K6pzirabRZ0",
    meal: "Lunch",
    title: "Crunchy Chickpea Pita",
    summary: "Mashed chickpeas, pickles, celery, yogurt, and greens.",
    cost: 2.8,
    minutes: 14,
    protein: 22,
    tags: ["quick", "balanced", "vegetarian", "leftovers"],
    provider: "YouTube + AI",
    source: "Fitgreenmind",
    sourceUrl: "https://www.youtube.com/watch?v=K6pzirabRZ0",
    image: "https://i.ytimg.com/vi/K6pzirabRZ0/hqdefault.jpg",
    ingredients: [
      ["chickpeas", 0.5, "can", "pantry"],
      ["pita bread", 1, "each", "bakery"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["celery", 0.25, "cup", "produce"],
      ["romaine", 1, "cup", "produce"]
    ]
  },
  {
    id: "youtube-lunch-jyKvy8gU7lA",
    meal: "Lunch",
    title: "Quinoa Black Bean Meal Prep Bowls",
    summary: "Quinoa, black beans, corn, peppers, salsa, and avocado-lime sauce.",
    cost: 3.1,
    minutes: 24,
    protein: 24,
    tags: ["balanced", "batch", "vegetarian", "vegan", "gluten-free", "leftovers"],
    provider: "YouTube + AI",
    source: "Plant Powered with Kristina",
    sourceUrl: "https://www.youtube.com/watch?v=jyKvy8gU7lA",
    image: "https://i.ytimg.com/vi/jyKvy8gU7lA/hqdefault.jpg",
    ingredients: [
      ["quinoa", 0.5, "cup", "pantry"],
      ["black beans", 0.5, "can", "pantry"],
      ["frozen corn", 0.25, "cup", "frozen"],
      ["bell peppers", 0.5, "each", "produce"],
      ["salsa", 2, "tbsp", "pantry"]
    ]
  },
  {
    id: "youtube-dinner-35s0LHZ-hiE",
    meal: "Dinner",
    title: "Sheet Pan Sausage and Veg",
    summary: "Sausage, potatoes, peppers, and onions roasted together.",
    cost: 4.15,
    minutes: 30,
    protein: 29,
    tags: ["batch", "family", "leftovers", "high-protein", "gluten-free"],
    provider: "YouTube + AI",
    source: "The Stay At Home Chef",
    sourceUrl: "https://www.youtube.com/watch?v=35s0LHZ-hiE",
    image: "https://i.ytimg.com/vi/35s0LHZ-hiE/hqdefault.jpg",
    ingredients: [
      ["chicken sausage", 0.3, "lb", "meat"],
      ["potatoes", 0.5, "lb", "produce"],
      ["bell peppers", 0.5, "each", "produce"],
      ["yellow onion", 0.25, "each", "produce"]
    ]
  },
  {
    id: "youtube-dinner-O_glcmhDh28",
    meal: "Dinner",
    title: "Peanut Tofu Rice Noodles",
    summary: "Crispy tofu, rice noodles, cabbage, carrots, and peanut sauce.",
    cost: 3.75,
    minutes: 25,
    protein: 27,
    tags: ["balanced", "vegetarian", "vegan", "gluten-free", "leftovers", "high-protein"],
    provider: "YouTube + AI",
    source: "Marley's Menu",
    sourceUrl: "https://www.youtube.com/watch?v=O_glcmhDh28",
    image: "https://i.ytimg.com/vi/O_glcmhDh28/hqdefault.jpg",
    ingredients: [
      ["extra firm tofu", 0.5, "block", "produce"],
      ["rice noodles", 0.5, "cup", "pantry"],
      ["shredded cabbage", 1, "cup", "produce"],
      ["carrots", 0.5, "cup", "produce"],
      ["peanut butter", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "youtube-dinner-HJMOc0_fFco",
    meal: "Dinner",
    title: "Red Lentil Coconut Curry",
    summary: "Lentils simmered with coconut milk, tomatoes, and spinach.",
    cost: 3.2,
    minutes: 30,
    protein: 24,
    tags: ["batch", "vegetarian", "vegan", "gluten-free", "balanced", "leftovers"],
    provider: "YouTube + AI",
    source: "Nico's Recipes",
    sourceUrl: "https://www.youtube.com/watch?v=HJMOc0_fFco",
    image: "https://i.ytimg.com/vi/HJMOc0_fFco/hqdefault.jpg",
    ingredients: [
      ["red lentils", 0.5, "cup", "pantry"],
      ["coconut milk", 0.25, "can", "pantry"],
      ["diced tomatoes", 0.5, "can", "pantry"],
      ["baby spinach", 1, "cup", "produce"],
      ["rice", 0.5, "cup", "pantry"]
    ]
  },
  {
    id: "youtube-breakfast-air-fryer-egg-bites",
    meal: "Breakfast",
    title: "Air Fryer Egg White Bites",
    summary: "Egg whites, cottage cheese, spinach, peppers, and feta cooked in silicone cups.",
    cost: 2.6,
    minutes: 18,
    protein: 28,
    tags: ["quick", "batch", "leftovers", "high-protein", "high-protein-low-carb", "low-carb", "gluten-free", "vegetarian"],
    provider: "PrepWise curated",
    source: "PrepWise kitchen",
    sourceUrl: "",
    image: "",
    ingredients: [
      ["egg whites", 0.75, "cup", "dairy"],
      ["cottage cheese", 0.25, "cup", "dairy"],
      ["baby spinach", 0.5, "cup", "produce"],
      ["bell pepper", 0.25, "each", "produce"],
      ["feta cheese", 1, "tbsp", "dairy"]
    ]
  },
  {
    id: "youtube-lunch-air-fryer-chicken-rice-bowls",
    meal: "Lunch",
    title: "Air Fryer Chicken Rice Bowls",
    summary: "Crispy air-fryer chicken, rice, broccoli, carrots, and yogurt ranch sauce.",
    cost: 4.35,
    minutes: 28,
    protein: 43,
    tags: ["quick", "batch", "family", "leftovers", "balanced", "high-protein"],
    provider: "PrepWise curated",
    source: "PrepWise kitchen",
    sourceUrl: "",
    image: "",
    ingredients: [
      ["chicken breast", 5, "oz", "meat"],
      ["rice", 0.5, "cup", "pantry"],
      ["broccoli florets", 1, "cup", "produce"],
      ["carrots", 0.5, "cup", "produce"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["ranch seasoning", 1, "tsp", "pantry"]
    ]
  },
  {
    id: "youtube-lunch-air-fryer-tofu-power-bowls",
    meal: "Lunch",
    title: "Air Fryer Tofu Power Bowls",
    summary: "Crispy tofu with quinoa, edamame, cabbage, carrots, and sesame sauce.",
    cost: 3.55,
    minutes: 26,
    protein: 30,
    tags: ["balanced", "batch", "vegetarian", "vegan", "gluten-free", "leftovers", "high-protein"],
    provider: "PrepWise curated",
    source: "PrepWise kitchen",
    sourceUrl: "",
    image: "",
    ingredients: [
      ["extra firm tofu", 0.5, "block", "produce"],
      ["quinoa", 0.5, "cup", "pantry"],
      ["shelled edamame", 0.5, "cup", "frozen"],
      ["shredded cabbage", 1, "cup", "produce"],
      ["carrots", 0.5, "cup", "produce"],
      ["sesame dressing", 1, "tbsp", "refrigerated"]
    ]
  },
  {
    id: "youtube-dinner-air-fryer-salmon-sweet-potato",
    meal: "Dinner",
    title: "Air Fryer Salmon Sweet Potato Bowls",
    summary: "Air-fryer salmon with sweet potatoes, green beans, spinach, and lemon yogurt sauce.",
    cost: 5.65,
    minutes: 30,
    protein: 39,
    tags: ["quick", "batch", "leftovers", "balanced", "high-protein", "gluten-free"],
    provider: "PrepWise curated",
    source: "PrepWise kitchen",
    sourceUrl: "",
    image: "",
    ingredients: [
      ["salmon fillet", 5, "oz", "meat"],
      ["sweet potato", 0.5, "lb", "produce"],
      ["green beans", 1, "cup", "produce"],
      ["baby spinach", 1, "cup", "produce"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["lemon", 0.25, "each", "produce"]
    ]
  },
  {
    id: "youtube-dinner-air-fryer-turkey-meatballs",
    meal: "Dinner",
    title: "Air Fryer Turkey Meatball Pasta",
    summary: "Lean turkey meatballs, marinara, pasta, zucchini, and Parmesan for easy reheats.",
    cost: 4.4,
    minutes: 30,
    protein: 38,
    tags: ["batch", "family", "leftovers", "balanced", "high-protein"],
    provider: "PrepWise curated",
    source: "PrepWise kitchen",
    sourceUrl: "",
    image: "",
    ingredients: [
      ["ground turkey", 0.35, "lb", "meat"],
      ["pasta", 2, "oz", "pantry"],
      ["marinara sauce", 0.5, "cup", "pantry"],
      ["zucchini", 0.5, "each", "produce"],
      ["Parmesan cheese", 1, "tbsp", "dairy"],
      ["Italian seasoning", 1, "tsp", "pantry"]
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
    setSecurityHeaders(req, res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

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
        devBillingBypass: isDevelopmentBillingBypassEnabled(),
        posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
        posthogKey: process.env.POSTHOG_KEY || "",
        release: process.env.VERCEL_GIT_COMMIT_SHA || "",
        sentryDsn: process.env.SENTRY_DSN || "",
        sentryTracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
        instacartProductsEnabled: process.env.ENABLE_INSTACART_SCRAPER === "true",
        tastyProviderEnabled: process.env.ENABLE_TASTY_PROVIDER === "true",
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

    if (requestUrl.pathname === "/api/billing/native/verify") {
      await handleNativeBillingVerificationRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/billing/native/context") {
      await handleNativeBillingContextRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/revenuecat/webhook") {
      await handleRevenueCatWebhookRequest(req, res);
      return;
    }

    if (requestUrl.pathname === "/api/referrals/click") {
      await handleReferralClickRequest(req, res);
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
        sendJson(res, 502, { error: "Nearby store addresses could not be loaded" });
      }
      return;
    }

    if (requestUrl.pathname.startsWith("/r/")) {
      await handleReferralRedirect(req, res, requestUrl);
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

  listenWithPortFallback(server, PORT);
}

module.exports = handleRequest;

function listenWithPortFallback(server, port, attempts = 0) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && !process.env.PORT && attempts < PORT_FALLBACK_LIMIT) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying http://${HOST}:${nextPort}...`);
      listenWithPortFallback(server, nextPort, attempts + 1);
      return;
    }

    throw error;
  });

  server.listen(port, HOST, () => {
    console.log(`PrepWise running at http://${HOST}:${port}`);
  });
}

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
  const hasRapidApi = Boolean(process.env.RAPIDAPI_KEY);
  const hasYoutubeRecipes = Boolean(process.env.OPENAI_API_KEY && process.env.YOUTUBE_API_KEY);
  if (!hasRapidApi && !hasYoutubeRecipes) {
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
  if (isDevelopmentBillingBypassEnabled()) {
    sendJson(res, 409, { error: "Development billing bypass is active" });
    return;
  }
  requireBillingConfiguration();
  const body = await readJsonBody(req);
  const plan = body.plan === "yearly" ? "yearly" : "monthly";
  const referral = sanitizeReferralPayload(body.referral);
  const referralCode = referral?.code || "";
  const priceId = plan === "yearly"
    ? process.env.STRIPE_YEARLY_PRICE_ID
    : process.env.STRIPE_MONTHLY_PRICE_ID;
  const convex = authenticatedConvexClient(req);
  const identity = await convex.query(anyApi.app.billingIdentity, {});
  if (referralCode && identity.referralCode !== referralCode) {
    await convex.mutation(anyApi.app.claimReferral, referral);
  }
  const stripe = stripeClient();
  let customerId = identity.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: identity.email || undefined,
      metadata: {
        convexUserId: String(identity.userId),
        ...(referralCode ? { prepwiseReferralCode: referralCode } : {})
      }
    });
    customerId = customer.id;
    await convex.mutation(anyApi.app.setStripeCustomer, {
      stripeCustomerId: customerId,
      ...(referral ? { referral } : {})
    });
  } else if (referralCode) {
    await stripe.customers.update(customerId, {
      metadata: { prepwiseReferralCode: referralCode }
    });
  }

  const origin = publicAppOrigin(requestUrl);
  const metadata = {
    convexUserId: String(identity.userId),
    ...(referralCode ? { prepwiseReferralCode: referralCode } : {})
  };
  const subscriptionData = {
    metadata,
    ...(plan === "monthly" ? { trial_period_days: 7 } : {})
  };
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    client_reference_id: String(identity.userId),
    metadata,
    subscription_data: subscriptionData,
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
  const referralCode = sanitizeReferralCode(subscription.metadata?.prepwiseReferralCode);
  await systemConvexClient().mutation(anyApi.billing.applyStripeEvent, {
    syncSecret: process.env.STRIPE_SYNC_SECRET,
    eventId: event.id,
    eventType: event.type,
    customerId,
    subscriptionId: subscription.id,
    priceId: firstItem?.price?.id,
    ...(referralCode ? { referralCode } : {}),
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

async function handleNativeBillingVerificationRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!process.env.NATIVE_BILLING_SYNC_SECRET) {
    sendJson(res, 503, { error: "Native billing verification is not configured" });
    return;
  }

  const body = await readJsonBody(req);
  const referral = sanitizeReferralPayload(body.referral);
  const verified = body.platform === "ios"
    ? await verifyAppleTransaction(body)
    : body.platform === "android"
      ? await verifyGooglePlayPurchase(body)
      : null;
  if (!verified) {
    sendJson(res, 400, { error: "Unknown native billing platform" });
    return;
  }

  const nativeSubscriptionPayload = {
    syncSecret: process.env.NATIVE_BILLING_SYNC_SECRET,
    platform: verified.platform,
    productId: verified.productId,
    originalTransactionId: verified.originalTransactionId,
    ...(referral?.code ? { referralCode: referral.code } : {}),
    status: verified.status,
    currentPeriodEnd: verified.currentPeriodEnd
  };
  if (verified.purchaseTokenHash) nativeSubscriptionPayload.purchaseTokenHash = verified.purchaseTokenHash;
  const appAccountToken = verified.appAccountToken || sanitizeUuid(body.appAccountToken);
  const revenueCatAppUserId = sanitizeIdentifier(body.revenueCatAppUserId);
  if (appAccountToken) nativeSubscriptionPayload.appAccountToken = appAccountToken;
  if (revenueCatAppUserId) nativeSubscriptionPayload.revenueCatAppUserId = revenueCatAppUserId;
  await authenticatedConvexClient(req).mutation(anyApi.billing.applyNativeSubscription, nativeSubscriptionPayload);
  sendJson(res, 200, {
    state: verified.state,
    entitlement: {
      productId: verified.productId,
      state: verified.status,
      originalTransactionId: verified.originalTransactionId,
      expiresAt: verified.currentPeriodEnd
        ? new Date(verified.currentPeriodEnd).toISOString()
        : null,
      source: `${verified.platform}-server-verified`
    }
  });
}

async function handleNativeBillingContextRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  const body = await readJsonBody(req);
  const referral = sanitizeReferralPayload(body.referral);
  const convex = authenticatedConvexClient(req);
  const identity = await convex.query(anyApi.app.billingIdentity, {});
  const appAccountToken = sanitizeUuid(identity.appAccountToken) || crypto.randomUUID();
  const revenueCatAppUserId = sanitizeIdentifier(identity.revenueCatAppUserId) || String(identity.userId);
  const context = await convex.mutation(anyApi.app.ensureNativeBillingContext, {
    appAccountToken,
    revenueCatAppUserId,
    ...(referral ? { referral: { ...referral, provider: referral.provider || "native-attribution" } } : {})
  });
  sendJson(res, 200, {
    appAccountToken: context.appAccountToken,
    revenueCatAppUserId: context.revenueCatAppUserId,
    referralCode: context.referralCode
  });
}

async function handleRevenueCatWebhookRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!process.env.REVENUECAT_WEBHOOK_SECRET) {
    sendJson(res, 503, { error: "RevenueCat webhook sync is not configured" });
    return;
  }
  const auth = String(req.headers.authorization || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerSecret = String(req.headers["x-revenuecat-secret"] || "");
  if (![bearer, headerSecret].includes(process.env.REVENUECAT_WEBHOOK_SECRET)) {
    sendJson(res, 401, { error: "Unauthorized RevenueCat webhook" });
    return;
  }

  const body = await readJsonBody(req);
  const event = normalizeRevenueCatEvent(body);
  await systemConvexClient().mutation(anyApi.billing.applyRevenueCatEvent, {
    syncSecret: process.env.REVENUECAT_WEBHOOK_SECRET,
    ...event
  });
  sendJson(res, 200, { received: true });
}

async function handleReferralClickRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }
  const body = await readJsonBody(req);
  const code = sanitizeReferralCode(body.code);
  if (!code) {
    sendJson(res, 400, { error: "Invalid referral code" });
    return;
  }
  await recordReferralClick(req, {
    code,
    landingPath: String(body.landingPath || "/").slice(0, 240)
  });
  sendJson(res, 200, { recorded: true });
}

async function handleReferralRedirect(req, res, requestUrl) {
  const code = sanitizeReferralCode(decodeURIComponent(requestUrl.pathname.slice(3)));
  if (!code) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }
  await recordReferralClick(req, {
    code,
    landingPath: `/r/${code}`
  });
  const target = new URL("/", publicAppOrigin(requestUrl));
  target.searchParams.set("via", code);
  res.writeHead(302, {
    Location: target.pathname + target.search,
    "Cache-Control": "no-store"
  });
  res.end();
}

async function verifyAppleTransaction(body) {
  if (typeof body.signedTransaction !== "string" || body.signedTransaction.length < 100) {
    throw Object.assign(new Error("A signed Apple transaction is required"), { statusCode: 400 });
  }
  const { decoded: transaction } = await verifyAppleSignedData(
    (verifier) => verifier.verifyAndDecodeTransaction(body.signedTransaction)
  );
  if (!["prepwise_pro_month_v2", "prepwise_pro_yearly"].includes(transaction.productId)) {
    throw Object.assign(new Error("Unknown Apple subscription product"), { statusCode: 400 });
  }
  if (!transaction.originalTransactionId) {
    throw Object.assign(new Error("Apple transaction is missing its original transaction ID"), {
      statusCode: 400
    });
  }
  const currentPeriodEnd = transaction.expiresDate || undefined;
  const status = transaction.revocationDate
    ? "revoked"
    : currentPeriodEnd && currentPeriodEnd <= Date.now()
      ? "expired"
      : "active";
  return {
    platform: "ios",
    productId: transaction.productId,
    originalTransactionId: transaction.originalTransactionId,
    appAccountToken: transaction.appAccountToken,
    status,
    state: status === "active" ? "success" : status,
    currentPeriodEnd
  };
}

function appleVerificationEnvironments() {
  const configured = String(process.env.APPLE_ENVIRONMENT || "AUTO").toUpperCase();
  if (configured === "PRODUCTION") return [AppleEnvironment.PRODUCTION];
  if (configured === "SANDBOX") return [AppleEnvironment.SANDBOX];
  return [AppleEnvironment.PRODUCTION, AppleEnvironment.SANDBOX];
}

function appleSignedDataVerifier(environment) {
  const appAppleId = environment === AppleEnvironment.PRODUCTION
    ? Number(process.env.APPLE_APP_ID)
    : undefined;
  if (environment === AppleEnvironment.PRODUCTION && !Number.isFinite(appAppleId)) {
    throw Object.assign(new Error("APPLE_APP_ID is required for production verification"), { statusCode: 503 });
  }
  return new SignedDataVerifier(
    appleRootCertificates(),
    true,
    environment,
    process.env.APPLE_BUNDLE_ID || "com.prepwise.app",
    appAppleId
  );
}

async function verifyAppleSignedData(decode) {
  let lastError;
  for (const environment of appleVerificationEnvironments()) {
    try {
      const verifier = appleSignedDataVerifier(environment);
      return { decoded: await decode(verifier), verifier };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function appleRootCertificates() {
  let encoded;
  try {
    encoded = JSON.parse(process.env.APPLE_ROOT_CA_BASE64_JSON || "[]");
  } catch {
    encoded = [];
  }
  if (!Array.isArray(encoded) || encoded.length === 0) {
    throw Object.assign(new Error("Apple root certificates are not configured"), { statusCode: 503 });
  }
  return encoded.map((certificate) => Buffer.from(certificate, "base64"));
}

async function verifyGooglePlayPurchase(body) {
  if (typeof body.purchaseToken !== "string" || body.purchaseToken.length < 20) {
    throw Object.assign(new Error("A Google Play purchase token is required"), { statusCode: 400 });
  }
  const credentials = googleServiceAccount();
  const accessToken = await googleServiceAccessToken(credentials);
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || "com.prepwise.app";
  const response = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(body.purchaseToken)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) {
    throw Object.assign(new Error(`Google Play verification returned ${response.status}`), {
      statusCode: response.status === 404 ? 400 : 502
    });
  }
  const purchase = await response.json();
  const lineItem = purchase.lineItems?.[0];
  if (!lineItem || !["prepwise_pro_month_v2", "prepwise_pro_yearly"].includes(lineItem.productId)) {
    throw Object.assign(new Error("Unknown Google Play subscription product"), { statusCode: 400 });
  }
  const states = {
    SUBSCRIPTION_STATE_ACTIVE: "active",
    SUBSCRIPTION_STATE_IN_GRACE_PERIOD: "grace_period",
    SUBSCRIPTION_STATE_CANCELED: "active",
    SUBSCRIPTION_STATE_PENDING: "billing_retry",
    SUBSCRIPTION_STATE_ON_HOLD: "expired",
    SUBSCRIPTION_STATE_PAUSED: "expired",
    SUBSCRIPTION_STATE_EXPIRED: "expired"
  };
  const status = states[purchase.subscriptionState] || "expired";
  const currentPeriodEnd = lineItem.expiryTime ? Date.parse(lineItem.expiryTime) : undefined;
  if (purchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING" &&
      ["active", "grace_period", "billing_retry"].includes(status)) {
    const acknowledge = await fetch(
      `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}/purchases/subscriptions/${encodeURIComponent(lineItem.productId)}/tokens/${encodeURIComponent(body.purchaseToken)}:acknowledge`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: "{}"
      }
    );
    if (!acknowledge.ok) {
      throw Object.assign(new Error(`Google Play acknowledgement returned ${acknowledge.status}`), {
        statusCode: 502
      });
    }
  }
  const purchaseTokenHash = crypto.createHash("sha256").update(body.purchaseToken).digest("hex");
  return {
    platform: "android",
    productId: lineItem.productId,
    originalTransactionId: purchaseTokenHash,
    purchaseTokenHash,
    status,
    state: ["active", "grace_period", "billing_retry"].includes(status) ? "success" : status,
    currentPeriodEnd
  };
}

function googleServiceAccount() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || "");
    if (!credentials.client_email || !credentials.private_key) throw new Error("Incomplete credentials");
    return credentials;
  } catch {
    throw Object.assign(new Error("Google Play service account is not configured"), { statusCode: 503 });
  }
}

async function googleServiceAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(JSON.stringify({
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  })).toString("base64url");
  const unsigned = `${header}.${claim}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(unsigned), credentials.private_key)
    .toString("base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`
    })
  });
  if (!response.ok) {
    throw Object.assign(new Error(`Google OAuth returned ${response.status}`), { statusCode: 502 });
  }
  return (await response.json()).access_token;
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
  const result = await processSignedNotification(body.signedPayload, verifyAppleNotification);
  if (result.update) {
    await systemConvexClient().mutation(anyApi.billing.applyAppleNotification, {
      syncSecret: process.env.NATIVE_BILLING_SYNC_SECRET,
      productId: result.update.productId,
      originalTransactionId: result.update.originalTransactionId,
      status: result.update.state,
      currentPeriodEnd: result.update.expiresAt
        ? Date.parse(result.update.expiresAt)
        : undefined
    });
  }
  sendJson(res, 200, result);
}

async function verifyAppleNotification(signedPayload) {
  const { decoded: notification, verifier } = await verifyAppleSignedData(
    (candidate) => candidate.verifyAndDecodeNotification(signedPayload)
  );
  const signedTransaction = notification.data?.signedTransactionInfo;
  const transaction = signedTransaction
    ? await verifier.verifyAndDecodeTransaction(signedTransaction)
    : null;
  return {
    notificationUUID: notification.notificationUUID,
    notificationType: notification.notificationType,
    subtype: notification.subtype,
    transaction: transaction
      ? {
          productId: transaction.productId,
          originalTransactionId: transaction.originalTransactionId,
          expiresDate: transaction.expiresDate
            ? new Date(transaction.expiresDate).toISOString()
            : null
        }
      : null
  };
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
    sendJson(res, 503, { error: "Nearby store lookup is not configured" });
    return;
  }

  if (storeCache.has(zip)) {
    sendJson(res, 200, storeCache.get(zip));
    return;
  }

  const geocode = await geocodeUsZip(zip);
  const location = geocode.results?.[0]?.geometry?.location;

  if (geocode.status !== "OK" || !location) {
    sendJson(res, 404, { error: "ZIP code could not be geocoded" });
    return;
  }

  const nearbyPlaces = await fetchNearbyGroceryPlaces(zip, location);

  const stores = dedupeStoreBrands(nearbyPlaces
    .filter(isGroceryStore)
    .map((place, index) => normalizeStore(place, location, index))
    .filter((store) => store.address))
    .slice(0, 8);

  if (!stores.length) {
    sendJson(res, 404, { error: "No nearby grocery stores with verified addresses were found" });
    return;
  }

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

async function geocodeUsZip(zip) {
  const attempts = [
    new URLSearchParams({ components: `postal_code:${zip}|country:US`, language: "en" }),
    new URLSearchParams({ address: `${zip}, USA`, language: "en" }),
    new URLSearchParams({ address: zip, language: "en" })
  ];
  let lastGeocode = null;

  for (const params of attempts) {
    try {
      const geocode = await rapidApiGetFromHost(
        GOOGLE_PLACES_RAPIDAPI_HOST,
        `/maps/api/geocode/json?${params}`
      );
      lastGeocode = geocode;
      if (geocode.status === "OK" && geocode.results?.[0]?.geometry?.location) {
        return geocode;
      }
    } catch (error) {
      console.warn("RapidAPI ZIP geocode failed", error.message);
    }
  }

  return await geocodeUsZipFallback(zip) || lastGeocode || { status: "ZERO_RESULTS", results: [] };
}

async function geocodeUsZipFallback(zip) {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
    if (!response.ok) return null;
    const data = await response.json();
    const place = Array.isArray(data.places) ? data.places[0] : null;
    const lat = Number(place?.latitude);
    const lng = Number(place?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      status: "OK",
      results: [{
        formatted_address: `${place["place name"] || zip}, ${place["state abbreviation"] || ""} ${zip}`.trim(),
        geometry: { location: { lat, lng } }
      }]
    };
  } catch (error) {
    console.warn("Fallback ZIP geocode failed", error.message);
    return null;
  }
}

async function fetchNearbyGroceryPlaces(zip, location) {
  const providers = [
    () => fetchGooglePlacesV2Nearby(location),
    () => fetchGooglePlacesV2TextSearch(zip),
    () => fetchOpenStreetMapGroceryPlaces(location),
    () => fetchGooglePlacesLegacyNearby(location),
    () => fetchGooglePlacesLegacyTextSearch(zip)
  ];
  const errors = [];

  for (const provider of providers) {
    try {
      const places = await provider();
      if (places.length) return places;
    } catch (error) {
      errors.push(error.message);
      console.warn("Nearby grocery provider failed", error.message);
    }
  }

  if (errors.length) {
    throw new Error(`Nearby store provider failed: ${errors.join(" | ")}`);
  }

  return [];
}

async function fetchGooglePlacesV2Nearby(location) {
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

  return nearby.places || [];
}

async function fetchGooglePlacesV2TextSearch(zip) {
  const search = await rapidApiPostToHost(
    GOOGLE_PLACES_NEW_RAPIDAPI_HOST,
    "/v1/places:searchText",
    {
      textQuery: `grocery stores near ${zip}`,
      languageCode: "en",
      regionCode: "US",
      maxResultCount: 20
    },
    30000,
    {
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.types,places.primaryType"
    }
  );

  return search.places || [];
}

async function fetchOpenStreetMapGroceryPlaces(location) {
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

  const viewbox = [
    (lng - 0.1).toFixed(4),
    (lat + 0.1).toFixed(4),
    (lng + 0.1).toFixed(4),
    (lat - 0.1).toFixed(4)
  ].join(",");
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    format: "jsonv2",
    q: "supermarket",
    limit: "12",
    addressdetails: "1",
    bounded: "1",
    viewbox
  }).toString();

  const response = await fetch(url, {
    headers: {
      "User-Agent": "PrepWise/1.0 (creativesolutionssupport@gmail.com)",
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`OpenStreetMap returned ${response.status}`);
  }

  const results = await response.json();
  return (Array.isArray(results) ? results : []).map((place, index) => ({
    id: `osm-${place.osm_type || "place"}-${place.osm_id || index}`,
    name: place.name || place.address?.shop || "Nearby grocery store",
    formattedAddress: place.display_name || formatOsmAddress(place.address),
    location: {
      latitude: Number(place.lat),
      longitude: Number(place.lon)
    },
    rating: null,
    userRatingCount: 0,
    types: ["supermarket"]
  }));
}

function formatOsmAddress(address = {}) {
  return [
    [address.house_number, address.road].filter(Boolean).join(" "),
    address.city || address.town || address.village,
    address.state,
    address.postcode
  ].filter(Boolean).join(", ");
}

async function fetchGooglePlacesLegacyNearby(location) {
  const nearby = await rapidApiGetFromHost(
    GOOGLE_PLACES_RAPIDAPI_HOST,
    `/maps/api/place/nearbysearch/json?${new URLSearchParams({
      location: `${location.lat},${location.lng}`,
      radius: "8000",
      type: "supermarket",
      language: "en"
    })}`
  );

  return nearby.results || [];
}

async function fetchGooglePlacesLegacyTextSearch(zip) {
  const search = await rapidApiGetFromHost(
    GOOGLE_PLACES_RAPIDAPI_HOST,
    `/maps/api/place/textsearch/json?${new URLSearchParams({
      query: `grocery stores near ${zip}`,
      region: "us",
      language: "en"
    })}`
  );

  return search.results || [];
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
  const providers = [];

  if (process.env.RAPIDAPI_KEY) {
    providers.push(fetchSpoonacularMealPrepRecipes(preference));
  }

  if (process.env.RAPIDAPI_KEY && process.env.ENABLE_TASTY_PROVIDER === "true") {
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

  if (cached && Date.now() - cached.createdAt < 90 * 60 * 1000) {
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
  const mealSearches = youtubeMealSearches();
  const searchCandidates = [];

  for (const [meal, query, order] of mealSearches) {
    const response = await youtubeApiGet(
      `/youtube/v3/search?${new URLSearchParams({
        part: "snippet",
        type: "video",
        q: `${query} ${youtubePreferenceQuery(preference)}`.trim(),
        maxResults: "50",
        order,
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
        channelId: item.snippet.channelId || "",
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

  const detailItems = [];
  for (let index = 0; index < candidateIds.length; index += 50) {
    const detailsResponse = await youtubeApiGet(
      `/youtube/v3/videos?${new URLSearchParams({
        part: "snippet,contentDetails,status",
        id: candidateIds.slice(index, index + 50).join(",")
      })}`
    );
    detailItems.push(...(detailsResponse.items || []));
  }
  const detailsById = new Map(detailItems.map((item) => [item.id, item]));
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
        ).slice(0, 2500),
        image: officialYoutubeThumbnail(details.snippet?.thumbnails) || video.image
      };

      return durationMinutes <= 90 &&
        isSpecificYoutubeRecipeCandidate(candidate) &&
        (isYoutubeMealMatch(candidate, video.meal) || isLikelyYoutubeRecipeVideo(candidate))
        ? candidate
        : null;
    })
    .filter(Boolean)
    .filter((video, index, items) =>
      items.findIndex((candidate) => candidate.videoId === video.videoId) === index
    );
  const diverseVideos = mealsWithRecipeLimit(
    limitYoutubeVideosPerChannel(detailedVideos, YOUTUBE_VIDEOS_PER_CHANNEL_PER_MEAL),
    YOUTUBE_VIDEOS_PER_MEAL
  );

  if (diverseVideos.length === 0) {
    return [];
  }

  return await extractYoutubeRecipesInBatches(diverseVideos, preference);
}

function youtubeMealSearches() {
  const queryGroups = {
    Breakfast: [
      "meal prep breakfast recipes",
      "make ahead breakfast meal prep recipes",
      "healthy breakfast meal prep recipe",
      "air fryer breakfast meal prep egg bites"
    ],
    Lunch: [
      "meal prep lunch recipes",
      "weekly lunch meal prep recipes",
      "healthy lunch meal prep recipe",
      "air fryer chicken meal prep bowls",
      "air fryer tofu meal prep bowls"
    ],
    Dinner: [
      "meal prep dinner recipes",
      "weekly dinner meal prep recipes",
      "healthy dinner meal prep recipe",
      "air fryer dinner meal prep recipes",
      "air fryer salmon meal prep bowls",
      "sheet pan meal prep dinner recipes"
    ]
  };

  return Object.entries(queryGroups).flatMap(([meal, queries]) => {
    const randomized = shuffle([...queries]);
    return [
      [meal, randomized[0], "relevance"],
      [meal, randomized[1], "date"]
    ];
  });
}

function limitYoutubeVideosPerChannel(videos, limit) {
  const channelCounts = new Map();
  return videos.filter((video) => {
    const channelKey = `${video.meal}:${video.channelId || video.channel || "unknown"}`;
    const count = channelCounts.get(channelKey) || 0;
    if (count >= limit) return false;
    channelCounts.set(channelKey, count + 1);
    return true;
  });
}

async function extractYoutubeRecipesInBatches(videos, preference) {
  const recipes = [];
  for (let index = 0; index < videos.length; index += YOUTUBE_EXTRACTION_BATCH_SIZE) {
    recipes.push(...await extractYoutubeRecipes(
      videos.slice(index, index + YOUTUBE_EXTRACTION_BATCH_SIZE),
      preference
    ));
  }
  return recipes;
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
                required: ["videoId", "meal", "title", "summary", "minutes", "protein", "cost", "tags", "ingredients"],
                properties: {
                  videoId: { type: "string" },
                  meal: { type: "string", enum: ["Breakfast", "Lunch", "Dinner"] },
                  title: { type: "string" },
                  summary: { type: "string" },
                  minutes: { type: "number" },
                  protein: { type: "number" },
                  cost: { type: "number" },
                  tags: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["balanced", "high-protein", "high-protein-low-carb", "low-calorie", "low-carb", "vegetarian", "vegan", "gluten-free", "quick", "batch", "family", "leftovers"]
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
          "Analyze each supplied YouTube video by its own public title and description, not by the creator's broader channel. Return at most one meal-prep recipe per source video: choose the specific dish most central to the video's title and most likely to be represented by its official thumbnail. Accept single-recipe videos, multi-recipe meal-prep videos, compilations, weekly prep videos, and meal plans only when one thumbnail-representative recipe has enough ingredient evidence. Reject videos that contain advice or vague ideas without enough evidence for a specific dish and ingredients. Never invent a dish or ingredients unrelated to the supplied video content. Each recipe must preserve its source videoId and include its Breakfast, Lunch, or Dinner meal category, a specific dish title, summary, minutes, protein, cost, tags, and ingredients. Ingredients must be an array of objects with name, amount, unit, and category. Amounts must be realistic amounts per person for one serving. category must be produce, meat, dairy, bakery, frozen, refrigerated, or pantry. minutes must be 30 or less. cost is estimated US dollars per serving. tags may include balanced, high-protein, high-protein-low-carb, low-calorie, low-carb, vegetarian, vegan, gluten-free, quick, batch, family, and leftovers."
      },
      {
        role: "user",
        content: JSON.stringify({
          dietaryPreference: preference,
          videos: videos.map((video) => ({
            meal: video.meal,
            videoId: video.videoId,
            sourceTitle: video.title,
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
  if (!isSpecificRecipeTitle(recipeTitle)) {
    return null;
  }
  const meal = ["Breakfast", "Lunch", "Dinner"].includes(recipe.meal)
    ? recipe.meal
    : video.meal;

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
      .filter((tag) => ["balanced", "high-protein", "high-protein-low-carb", "low-calorie", "low-carb", "vegetarian", "vegan", "gluten-free", "quick", "batch", "family", "leftovers"].includes(tag))
  );

  tags.add("leftovers");
  if (minutes <= 20) tags.add("quick");
  if (preference !== "balanced") tags.add(preference);

  return {
    id: `youtube-${meal.toLowerCase()}-${video.videoId}-${recipeTitleId(recipeTitle)}`,
    meal,
    title: recipeTitle.slice(0, 100),
    summary: String(
      recipe.summary
        ? `AI-generated from the linked video's public title and description. ${recipe.summary}`
        : "AI-generated from the linked video's public title and description."
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

function recipeTitleId(title) {
  return crypto
    .createHash("sha256")
    .update(String(title || "").trim().toLowerCase())
    .digest("hex")
    .slice(0, 10);
}

function youtubePreferenceQuery(preference) {
  const queries = {
    balanced: "",
    "high-protein": "high protein",
    "high-protein-low-carb": "high protein low carb",
    "low-calorie": "low calorie",
    "low-carb": "low carb",
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
  const patterns = {
    Breakfast: /\b(breakfast|overnight oats?|oatmeal|egg|omelet|pancake|waffle|smoothie|chia pudding|breakfast burrito)\b/,
    Lunch: /\b(lunch|lunchbox|midday|meal prep|grain bowl|salad|wrap|sandwich)\b/,
    Dinner: /\b(dinner|supper|weeknight|one pot|sheet pan|skillet|casserole|air fryer|bowl)\b/
  };

  return patterns[meal]?.test(text) || false;
}

function isSpecificYoutubeRecipeCandidate(video) {
  const text = `${video.title || ""} ${video.descriptionSnippet || ""}`.toLowerCase();
  return /\b(recipe|recipes|meal prep|weekly prep|make ahead|batch cook|air fryer|sheet pan|bowls?|oats?|oatmeal|eggs?|omelet|pancakes?|waffles?|smoothie|burrito|sandwich|wrap|salad|soup|chili|curry|chicken|turkey|beef|pork|salmon|shrimp|fish|pasta|noodles?|rice|quinoa|tacos?|pizza|casserole|stir[- ]?fry)\b/.test(text);
}

function isSpecificRecipeTitle(title) {
  const value = String(title || "").trim().toLowerCase();
  return value.length >= 4 &&
    !/^(meal prep|breakfast|lunch|dinner|healthy meal|easy meal|quick meal|high protein meal|meal plan|weekly meals?)(?: recipe)?$/.test(value);
}

function isLikelyYoutubeRecipeVideo(video) {
  const text = `${video.title || ""} ${video.descriptionSnippet || ""}`.toLowerCase();
  return /\b(recipe|recipes|meal prep|weekly prep|batch cook|cook|air fryer|sheet pan|bowls?|breakfast|lunch|dinner|oats?|eggs?|chicken|beef|pasta|rice|salad|soup)\b/.test(text);
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

  return shuffle(mealsWithRecipeLimit(combined, YOUTUBE_RECIPES_PER_MEAL));
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
    "high-protein-low-carb": { minProtein: "25", maxCarbs: "20" },
    "low-calorie": { maxCalories: "500" },
    "low-carb": { maxCarbs: "20" },
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
    "high-protein-low-carb": ["high_protein", "low_carb"],
    "low-calorie": ["low_calorie"],
    "low-carb": ["low_carb"],
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
    coverage: place.coverage || "Map store location only, price estimate"
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
  if (preference === "high-protein" || preference === "high-protein-low-carb") tags.push("high-protein");
  if (preference === "high-protein-low-carb") tags.push("high-protein-low-carb", "low-carb");
  if (preference === "low-calorie") tags.push("low-calorie");
  if (preference === "low-carb") tags.push("low-carb");
  if (recipe.readyInMinutes && recipe.readyInMinutes <= 20) tags.push("quick");

  return [...new Set(tags)];
}

function buildTastyTags(tagNames, preference, minutes) {
  const tagSet = new Set(["balanced", "leftovers"]);

  if (minutes <= 20) tagSet.add("quick");
  if (tagNames.includes("high_protein") || preference === "high-protein" || preference === "high-protein-low-carb") tagSet.add("high-protein");
  if (tagNames.includes("low_calorie") || preference === "low-calorie") tagSet.add("low-calorie");
  if (tagNames.includes("low_carb")) tagSet.add("low-carb");
  if (preference === "high-protein-low-carb") {
    tagSet.add("high-protein-low-carb");
    tagSet.add("low-carb");
  }
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

    const extension = path.extname(filePath);
    const contentType = mimeTypes[extension] || "application/octet-stream";
    const cacheControl = [".html", ".js", ".css"].includes(extension) ? "no-cache" : "public, max-age=3600";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl
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
  const allowed = new Set(["balanced", "high-protein", "high-protein-low-carb", "low-calorie", "low-carb", "vegetarian", "vegan", "gluten-free"]);
  return allowed.has(value) ? value : "balanced";
}

function setSecurityHeaders(req, res) {
  const origin = req.headers.origin;
  const nativeOrigins = new Set([
    "capacitor://app.prepwise.local",
    "https://app.prepwise.local"
  ]);
  if (nativeOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "DELETE, GET, OPTIONS, POST");
    res.setHeader("Vary", "Origin");
  }
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
  if (!process.env.CONVEX_URL ||
      !(process.env.STRIPE_SYNC_SECRET || process.env.NATIVE_BILLING_SYNC_SECRET || process.env.REVENUECAT_WEBHOOK_SECRET)) {
    const error = new Error("Convex server synchronization is not configured");
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

function isDevelopmentBillingBypassEnabled() {
  return process.env.APP_ENV !== "production" && process.env.DEV_BILLING_BYPASS === "true";
}

function publicAppOrigin(requestUrl) {
  const configured = String(process.env.APP_URL || "").replace(/\/+$/, "");
  if (configured) return configured;
  return requestUrl.origin;
}

function sanitizeReferralCode(value) {
  const code = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return code.length >= 2 ? code : "";
}

function sanitizeReferralPayload(value) {
  const code = sanitizeReferralCode(value?.code);
  if (!code) return null;
  return {
    code,
    sourceParam: String(value?.sourceParam || "via").slice(0, 24),
    landingPath: String(value?.landingPath || "").slice(0, 240),
    capturedAt: Number(value?.capturedAt) || Date.now(),
    provider: String(value?.provider || "direct").slice(0, 40),
    clickId: String(value?.clickId || value?.linkClickId || "").slice(0, 120),
    campaign: String(value?.campaign || "").slice(0, 120)
  };
}

function sanitizeIdentifier(value, maxLength = 120) {
  const text = String(value || "").trim();
  if (!text) return undefined;
  return text.replace(/[^\w:.-]/g, "").slice(0, maxLength) || undefined;
}

function sanitizeUuid(value) {
  const text = String(value || "").trim().toLowerCase();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(text)
    ? text
    : undefined;
}

function normalizeRevenueCatEvent(body) {
  const event = body?.event || body || {};
  const aliases = Array.isArray(event.aliases) ? event.aliases : [];
  const subscriberAttributes = event.subscriber_attributes || event.subscriberAttributes || {};
  const referralCode = sanitizeReferralCode(
    event.referral_code ||
    event.referralCode ||
    subscriberAttributes.referral_code?.value ||
    subscriberAttributes.referral_creator?.value
  );
  const statusByType = {
    INITIAL_PURCHASE: "active",
    NON_RENEWING_PURCHASE: "active",
    RENEWAL: "active",
    PRODUCT_CHANGE: "active",
    UNCANCELLATION: "active",
    CANCELLATION: "active",
    EXPIRATION: "expired",
    BILLING_ISSUE: "billing_retry",
    SUBSCRIPTION_PAUSED: "paused",
    REFUND: "refunded",
    TRANSFER: "active",
  };
  const eventType = String(event.type || "UNKNOWN").toUpperCase();
  const expirationMs = Number(event.expiration_at_ms || event.expirationAtMs || 0);
  const appUserId = sanitizeIdentifier(event.app_user_id || event.appUserId || aliases[0]);
  const originalTransactionId = sanitizeIdentifier(
    event.original_transaction_id ||
    event.originalTransactionId ||
    event.original_app_user_id
  );

  return {
    eventId: sanitizeIdentifier(event.id || event.event_id || crypto.randomUUID(), 160),
    eventType,
    ...(appUserId ? { appUserId } : {}),
    ...(event.product_id || event.productId ? { productId: String(event.product_id || event.productId).slice(0, 120) } : {}),
    ...(originalTransactionId ? { originalTransactionId } : {}),
    ...(sanitizeUuid(event.app_account_token || event.appAccountToken) ? { appAccountToken: sanitizeUuid(event.app_account_token || event.appAccountToken) } : {}),
    ...(event.price_id || event.priceId ? { priceId: String(event.price_id || event.priceId).slice(0, 120) } : {}),
    ...(referralCode ? { referralCode } : {}),
    status: statusByType[eventType] || String(event.status || "active").slice(0, 40),
    ...(expirationMs > 0 ? { currentPeriodEnd: expirationMs } : {}),
    cancelAtPeriodEnd: ["CANCELLATION", "EXPIRATION", "REFUND"].includes(eventType)
  };
}

function hashReferralValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return undefined;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function recordReferralClick(req, click) {
  try {
    await systemConvexClient().mutation(anyApi.referrals.recordClick, {
      syncSecret: process.env.STRIPE_SYNC_SECRET,
      code: click.code,
      landingPath: click.landingPath,
      ipHash: hashReferralValue(req.headers["x-forwarded-for"] || req.socket?.remoteAddress),
      userAgentHash: hashReferralValue(req.headers["user-agent"])
    });
  } catch (error) {
    if (process.env.APP_ENV !== "production") {
      console.warn("Referral click was not persisted", error.message);
    }
  }
}

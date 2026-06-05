const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
loadLocalEnv();

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
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/api/recipes") {
      try {
        await handleRecipeRequest(requestUrl, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 200, []);
      }
      return;
    }

    if (requestUrl.pathname === "/api/ingredients/normalize") {
      try {
        await handleIngredientRequest(req, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "Ingredient provider request failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/ai/prep-tips") {
      try {
        await handlePrepTipsRequest(req, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "OpenAI prep helper failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/ai/meal-instructions") {
      try {
        await handleMealInstructionsRequest(req, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "OpenAI meal instructions failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/instacart/products") {
      try {
        await handleInstacartProductsRequest(requestUrl, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "Instacart provider request failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/instacart/product") {
      try {
        await handleInstacartProductRequest(req, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "Instacart product request failed", detail: error.message });
      }
      return;
    }

    if (requestUrl.pathname === "/api/stores") {
      try {
        await handleStoresRequest(requestUrl, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 200, fallbackStorePayload(requestUrl));
      }
      return;
    }

    serveStatic(requestUrl.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unexpected server error" });
  }
}

if (require.main === module) {
  const server = http.createServer(handleRequest);

  server.listen(PORT, () => {
    console.log(`PrepWise running at http://localhost:${PORT}`);
  });
}

module.exports = handleRequest;

function loadLocalEnv() {
  const envPath = path.join(ROOT, ".env");
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
}

async function handleRecipeRequest(requestUrl, res) {
  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 200, []);
    return;
  }

  const preference = requestUrl.searchParams.get("preference") || "balanced";
  const recipes = await fetchMealPrepRecipes(preference);
  sendJson(res, 200, recipes);
}

async function handleIngredientRequest(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const body = await readJsonBody(req);
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients.slice(0, 12) : [];

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
  const results = await Promise.allSettled([
    fetchSpoonacularMealPrepRecipes(preference),
    fetchTastyMealPrepRecipes(preference)
  ]);

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

  return shuffle([...recipesByKey.values()]);
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

function recipeDedupeKey(recipe) {
  return `${recipe.meal}:${recipe.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString() || "{}"));
      } catch (error) {
        reject(error);
      }
    });
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
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

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
const ingredientCache = new Map();
const instacartCache = new Map();

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

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (requestUrl.pathname === "/api/recipes") {
      try {
        await handleRecipeRequest(requestUrl, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "Recipe provider request failed", detail: error.message });
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

    if (requestUrl.pathname === "/api/instacart/products") {
      try {
        await handleInstacartProductsRequest(requestUrl, res);
      } catch (error) {
        console.error(error);
        sendJson(res, 502, { error: "Instacart provider request failed", detail: error.message });
      }
      return;
    }

    serveStatic(requestUrl.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Unexpected server error" });
  }
});

server.listen(PORT, () => {
  console.log(`PrepWise running at http://localhost:${PORT}`);
});

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
    sendJson(res, 500, { error: "Missing RAPIDAPI_KEY" });
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

  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 500, { error: "Missing RAPIDAPI_KEY" });
    return;
  }

  const body = await readJsonBody(req);
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients.slice(0, 12) : [];
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

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, { error: "Missing OPENAI_API_KEY" });
    return;
  }

  const body = await readJsonBody(req);
  const meals = Array.isArray(body.meals) ? body.meals.slice(0, 3) : [];
  const prefs = body.preferences || {};

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
}

async function handleInstacartProductsRequest(requestUrl, res) {
  if (!process.env.RAPIDAPI_KEY) {
    sendJson(res, 500, { error: "Missing RAPIDAPI_KEY" });
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
    125000
  );
  const products = (response.data || []).slice(0, 12).map(normalizeInstacartProduct);

  instacartCache.set(url, products);
  sendJson(res, 200, products);
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
  const mealRequests = [
    ["Breakfast", ["breakfast"]],
    ["Lunch", ["main course"]],
    ["Dinner", ["main course"]]
  ];

  const recipes = [];

  for (const [meal, baseTags] of mealRequests) {
    const tags = [...baseTags, ...preferenceTags(preference)];
    const response = await rapidApiGet(
      `/recipes/random?${new URLSearchParams({
        tags: tags.join(","),
        number: "3",
        maxReadyTime: "30",
        includeNutrition: "true"
      })}`
    );

    recipes.push(
      ...(response.recipes || [])
        .map((recipe) => normalizeRecipe(recipe, meal, preference))
        .filter((recipe) => recipe.minutes <= 30)
    );
    await wait(1250);
  }

  return recipes;
}

function preferenceTags(preference) {
  const tags = {
    balanced: [],
    "high-protein": ["high protein"],
    vegetarian: ["vegetarian"],
    vegan: ["vegan"],
    "gluten-free": ["gluten free"]
  };

  return tags[preference] || [];
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
          reject(new Error(`Spoonacular returned ${apiRes.statusCode}: ${body}`));
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

function rapidApiPostToHost(hostname, apiPath, payload, timeoutMs = 30000) {
  const data = JSON.stringify(payload);
  const options = {
    method: "POST",
    hostname,
    path: apiPath,
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": hostname,
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
  const templateUrl = product.image?.view_section?.product_image?.template_url || "";

  return {
    id: product.id,
    name: product.name,
    size: product.size,
    url: product.url,
    image: templateUrl.replace("{width=}x{height=}", "240x240")
  };
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
  const ingredients = (recipe.extendedIngredients || []).slice(0, 6).map((ingredient) => [
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
    source: recipe.sourceName || "Spoonacular",
    image: recipe.image,
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

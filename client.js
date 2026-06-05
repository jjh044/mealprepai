const starterRecipeBank = [
  {
    id: "oat-bowl",
    meal: "Breakfast",
    title: "Berry Peanut Butter Oats",
    summary: "No-fuss oats with berries, peanut butter, and Greek yogurt.",
    cost: 2.1,
    minutes: 8,
    protein: 24,
    tags: ["quick", "family", "leftovers", "balanced", "vegetarian", "gluten-free"],
    source: "Food blog overnight oats post",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["rolled oats", 0.5, "cup", "pantry"],
      ["Greek yogurt", 0.5, "cup", "dairy"],
      ["frozen berries", 0.5, "cup", "frozen"],
      ["peanut butter", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "egg-wrap",
    meal: "Breakfast",
    title: "Spinach Egg Breakfast Wrap",
    summary: "Scrambled eggs, spinach, salsa, and cheese in a tortilla.",
    cost: 2.55,
    minutes: 12,
    protein: 27,
    tags: ["quick", "family", "balanced", "high-protein", "vegetarian"],
    source: "Social media breakfast wrap video",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["eggs", 2, "each", "dairy"],
      ["flour tortillas", 1, "each", "bakery"],
      ["baby spinach", 1, "cup", "produce"],
      ["shredded cheese", 0.25, "cup", "dairy"],
      ["salsa", 2, "tbsp", "pantry"]
    ]
  },
  {
    id: "cottage-toast",
    meal: "Breakfast",
    title: "Cottage Cheese Tomato Toast",
    summary: "Crisp toast with cottage cheese, tomatoes, pepper, and herbs.",
    cost: 2.35,
    minutes: 7,
    protein: 25,
    tags: ["quick", "vegetarian", "high-protein"],
    source: "Social media cottage cheese toast trend",
    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["whole grain bread", 2, "slices", "bakery"],
      ["cottage cheese", 0.5, "cup", "dairy"],
      ["tomatoes", 0.5, "cup", "produce"],
      ["everything seasoning", 1, "tsp", "pantry"]
    ]
  },
  {
    id: "chia-protein-pudding",
    meal: "Breakfast",
    title: "Vegan Berry Chia Protein Pudding",
    summary: "Chia seeds, oat milk, berries, and plant protein prepped in jars.",
    cost: 2.65,
    minutes: 10,
    protein: 26,
    tags: ["quick", "balanced", "vegetarian", "vegan", "gluten-free", "leftovers", "high-protein"],
    source: "Vegan meal prep blog jar recipe",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["chia seeds", 2, "tbsp", "pantry"],
      ["oat milk", 0.5, "cup", "refrigerated"],
      ["plant protein powder", 1, "scoop", "pantry"],
      ["frozen berries", 0.5, "cup", "frozen"]
    ]
  },
  {
    id: "chicken-rice",
    meal: "Lunch",
    title: "Lemon Chicken Rice Bowls",
    summary: "Batch chicken, rice, cucumber, tomato, and yogurt sauce.",
    cost: 4.35,
    minutes: 28,
    protein: 38,
    tags: ["balanced", "batch", "family", "leftovers", "high-protein", "gluten-free"],
    source: "Meal prep blog chicken bowl recipe",
    image: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["chicken breast", 0.4, "lb", "meat"],
      ["rice", 0.5, "cup", "pantry"],
      ["cucumber", 0.5, "cup", "produce"],
      ["tomatoes", 0.5, "cup", "produce"],
      ["Greek yogurt", 0.25, "cup", "dairy"]
    ]
  },
  {
    id: "turkey-chili",
    meal: "Lunch",
    title: "Turkey Bean Chili",
    summary: "One-pot chili built for reheating all week.",
    cost: 3.95,
    minutes: 35,
    protein: 36,
    tags: ["batch", "family", "leftovers", "high-protein", "gluten-free", "balanced"],
    source: "Food blog turkey chili recipe",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["ground turkey", 0.35, "lb", "meat"],
      ["black beans", 0.5, "can", "pantry"],
      ["diced tomatoes", 0.5, "can", "pantry"],
      ["frozen corn", 0.25, "cup", "frozen"],
      ["chili seasoning", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "chickpea-salad",
    meal: "Lunch",
    title: "Crunchy Chickpea Pita",
    summary: "Mashed chickpeas, pickles, celery, yogurt, and greens.",
    cost: 2.8,
    minutes: 14,
    protein: 22,
    tags: ["quick", "balanced", "vegetarian", "leftovers"],
    source: "Vegetarian food blog chickpea pita",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["chickpeas", 0.5, "can", "pantry"],
      ["pita bread", 1, "each", "bakery"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["celery", 0.25, "cup", "produce"],
      ["romaine", 1, "cup", "produce"]
    ]
  },
  {
    id: "tuna-pasta",
    meal: "Lunch",
    title: "Tuna Pasta Salad",
    summary: "Budget pantry pasta with tuna, peas, lemon, and yogurt dressing.",
    cost: 3.25,
    minutes: 18,
    protein: 31,
    tags: ["quick", "balanced", "family", "high-protein"],
    source: "Online pantry recipe roundup",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["pasta", 0.5, "cup", "pantry"],
      ["canned tuna", 1, "can", "pantry"],
      ["frozen peas", 0.25, "cup", "frozen"],
      ["Greek yogurt", 0.25, "cup", "dairy"],
      ["lemon", 0.25, "each", "produce"]
    ]
  },
  {
    id: "quinoa-black-bean-bowl",
    meal: "Lunch",
    title: "Quinoa Black Bean Meal Prep Bowls",
    summary: "Quinoa, black beans, corn, peppers, salsa, and avocado-lime sauce.",
    cost: 3.1,
    minutes: 24,
    protein: 24,
    tags: ["balanced", "batch", "vegetarian", "vegan", "gluten-free", "leftovers"],
    source: "Online vegan lunch bowl recipe",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["quinoa", 0.5, "cup", "pantry"],
      ["black beans", 0.5, "can", "pantry"],
      ["frozen corn", 0.25, "cup", "frozen"],
      ["bell peppers", 0.5, "each", "produce"],
      ["salsa", 2, "tbsp", "pantry"]
    ]
  },
  {
    id: "sheet-pan-sausage",
    meal: "Dinner",
    title: "Sheet Pan Sausage and Veg",
    summary: "Sausage, potatoes, peppers, and onions roasted together.",
    cost: 4.15,
    minutes: 32,
    protein: 29,
    tags: ["batch", "family", "leftovers", "high-protein", "gluten-free"],
    source: "Sheet-pan dinner blog recipe",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["chicken sausage", 0.3, "lb", "meat"],
      ["potatoes", 0.5, "lb", "produce"],
      ["bell peppers", 0.5, "each", "produce"],
      ["yellow onion", 0.25, "each", "produce"]
    ]
  },
  {
    id: "tofu-noodles",
    meal: "Dinner",
    title: "Peanut Tofu Rice Noodles",
    summary: "Crispy tofu, rice noodles, cabbage, carrots, and peanut sauce.",
    cost: 3.75,
    minutes: 25,
    protein: 27,
    tags: ["balanced", "vegetarian", "vegan", "gluten-free", "leftovers", "high-protein"],
    source: "Plant-based social cooking video",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["extra firm tofu", 0.5, "block", "produce"],
      ["rice noodles", 0.5, "cup", "pantry"],
      ["shredded cabbage", 1, "cup", "produce"],
      ["carrots", 0.5, "cup", "produce"],
      ["peanut butter", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "beef-tacos",
    meal: "Dinner",
    title: "Skillet Beef Taco Bowls",
    summary: "Ground beef, beans, rice, salsa, lettuce, and cheese.",
    cost: 4.75,
    minutes: 24,
    protein: 34,
    tags: ["quick", "family", "leftovers", "high-protein", "gluten-free"],
    source: "Weeknight dinner blog taco bowl",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["ground beef", 0.3, "lb", "meat"],
      ["rice", 0.5, "cup", "pantry"],
      ["black beans", 0.5, "can", "pantry"],
      ["romaine", 1, "cup", "produce"],
      ["shredded cheese", 0.25, "cup", "dairy"]
    ]
  },
  {
    id: "salmon-tray",
    meal: "Dinner",
    title: "Garlic Salmon Tray Bake",
    summary: "Salmon, green beans, potatoes, and lemon on one tray.",
    cost: 6.6,
    minutes: 30,
    protein: 39,
    tags: ["balanced", "family", "high-protein", "gluten-free"],
    source: "Online seafood meal prep article",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["salmon fillet", 0.35, "lb", "meat"],
      ["green beans", 1, "cup", "produce"],
      ["potatoes", 0.4, "lb", "produce"],
      ["lemon", 0.5, "each", "produce"]
    ]
  },
  {
    id: "lentil-curry",
    meal: "Dinner",
    title: "Red Lentil Coconut Curry",
    summary: "Lentils simmered with coconut milk, tomatoes, and spinach.",
    cost: 3.2,
    minutes: 30,
    protein: 24,
    tags: ["batch", "vegetarian", "vegan", "gluten-free", "balanced", "leftovers"],
    source: "Simple vegan curry blog recipe",
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=700&q=80",
    ingredients: [
      ["red lentils", 0.5, "cup", "pantry"],
      ["coconut milk", 0.25, "can", "pantry"],
      ["diced tomatoes", 0.5, "can", "pantry"],
      ["baby spinach", 1, "cup", "produce"],
      ["rice", 0.5, "cup", "pantry"]
    ]
  }
];

let recipeBank = [...starterRecipeBank];

const fallbackStores = [
  { name: "Kroger", address: "Address unavailable until nearby stores load", distance: "1.4 mi", multiplier: 0.98, coverage: "price estimate, no live retailer pricing" },
  { name: "ALDI", address: "Address unavailable until nearby stores load", distance: "2.1 mi", multiplier: 0.9, coverage: "price estimate, no live retailer pricing" },
  { name: "Target Grocery", address: "Address unavailable until nearby stores load", distance: "2.6 mi", multiplier: 1.05, coverage: "price estimate, no live retailer pricing" },
  { name: "Whole Foods", address: "Address unavailable until nearby stores load", distance: "3.0 mi", multiplier: 1.24, coverage: "price estimate, no live retailer pricing" }
];

const meals = ["Breakfast", "Lunch", "Dinner"];
const prepDays = 5;

const form = document.querySelector("#planner-form");
const mealGrid = document.querySelector("#meal-grid");
const groceryList = document.querySelector("#grocery-list");
const storeList = document.querySelector("#store-list");
const storeContext = document.querySelector("#store-context");
const copyButton = document.querySelector("#copy-list");
const recipeSourceStatus = document.querySelector("#recipe-source-status");
const prepTipsPanel = document.querySelector("#prep-tips-panel");
const prepTipsContent = document.querySelector("#prep-tips-content");
const loadInstacartProductsButton = document.querySelector("#load-instacart-products");
const instacartProducts = document.querySelector("#instacart-products");

let currentPlan = [];
let currentGroceries = new Map();
let favoriteMeals = loadFavorites();
let lastRecipePreference = "";
let activeRenderId = 0;
let hasBuiltPlan = false;
let ingredientNutrition = new Map();
let activeTipsId = 0;
let activeStoresId = 0;
let activeInstructionsId = 0;
let recentRecipeIds = [];

function dollars(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("prepwise-favorites") || "[]");
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem("prepwise-favorites", JSON.stringify(favoriteMeals));
}

function isFavorite(id) {
  return favoriteMeals.some((meal) => meal.id === id);
}

function toggleFavorite(meal) {
  if (isFavorite(meal.id)) {
    favoriteMeals = favoriteMeals.filter((item) => item.id !== meal.id);
  } else {
    favoriteMeals = [
      ...favoriteMeals,
      {
        id: meal.id,
        meal: meal.meal,
        title: meal.title,
        summary: meal.summary,
        source: meal.source
      }
    ];
  }

  saveFavorites();
  renderPlan(currentPlan, getPreferences());
}

function fallbackImage(title) {
  const safeTitle = title.replace(/&/g, "and").replace(/[<>"]/g, "");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="700" height="450" viewBox="0 0 700 450">
      <rect width="700" height="450" fill="#e7f0eb"/>
      <circle cx="170" cy="150" r="72" fill="#2f7c57" opacity="0.18"/>
      <circle cx="560" cy="315" r="110" fill="#c74e37" opacity="0.14"/>
      <rect x="130" y="126" width="440" height="208" rx="18" fill="#ffffff" opacity="0.88"/>
      <text x="350" y="215" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#18231f">Meal Prep</text>
      <text x="350" y="262" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#65716c">${safeTitle}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getPreferences() {
  return {
    budget: Number(document.querySelector("#budget").value || 125),
    zip: document.querySelector("#zip").value || "local",
    people: Number(document.querySelector("#people").value || 1),
    preference: document.querySelector("input[name='preference']:checked").value
  };
}

function setRecipeStatus(message) {
  if (recipeSourceStatus) {
    recipeSourceStatus.textContent = message;
  }
}

function clearPlanViews(message) {
  if (mealGrid) {
    mealGrid.innerHTML = message ? `<p class="empty-state">${message}</p>` : "";
  }

  if (groceryList) {
    groceryList.innerHTML = "";
  }

  if (storeList) {
    storeList.innerHTML = "";
  }

  renderPrepTips(null);
}

async function loadRealRecipes(prefs, renderId) {
  if (location.protocol === "file:") {
    setRecipeStatus("Using starter recipe data. Run the local server to load live recipe APIs.");
    return;
  }

  if (lastRecipePreference === prefs.preference && recipeBank !== starterRecipeBank) {
    return;
  }

  setRecipeStatus("Loading real recipes from Spoonacular and Tasty...");

  try {
    const response = await fetch(`/api/recipes?preference=${encodeURIComponent(prefs.preference)}`);
    if (!response.ok) {
      throw new Error(`Recipe API returned ${response.status}`);
    }

    const recipes = await response.json();
    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Recipe API returned no recipes");
    }

    if (renderId !== activeRenderId) {
      return;
    }

    recipeBank = recipes;
    lastRecipePreference = prefs.preference;
    const providers = [...new Set(recipes.map((recipe) => recipe.provider || recipe.source).filter(Boolean))];
    setRecipeStatus(`Using live recipe data from ${providers.length ? providers.join(" and ") : "recipe APIs"}.`);
  } catch (error) {
    console.error(error);
    recipeBank = [...starterRecipeBank];
    lastRecipePreference = "";
    setRecipeStatus("Using starter recipe data. Live recipe APIs could not be loaded.");
  }
}

function matchesPreference(recipe, preference) {
  if (preference === "balanced") return recipe.tags.includes("balanced");
  if (preference === "high-protein") return recipe.tags.includes("high-protein") || recipe.protein >= 30;
  if (preference === "vegetarian") return recipe.tags.includes("vegetarian") || recipe.tags.includes("vegan");
  if (preference === "vegan") return recipe.tags.includes("vegan");
  if (preference === "gluten-free") return recipe.tags.includes("gluten-free");
  return true;
}

function scoreRecipe(recipe, prefs, mealIndex) {
  let score = 100 - recipe.cost * 7 - recipe.minutes * 0.35;

  if (recipe.tags.includes("batch")) score += 18;
  if (recipe.tags.includes("leftovers")) score += 14;
  if (matchesPreference(recipe, prefs.preference)) score += 24;
  if (recipe.protein >= 27) score += 10;
  if (recipe.tags.includes("family")) score += 6;
  if (mealIndex === 0 && recipe.minutes <= 12) score += 12;

  return score;
}

function isQuickPrep(recipe) {
  return Number(recipe.minutes || 0) <= 30;
}

function chooseFromTop(candidates, limit = 4) {
  const pool = candidates.slice(0, Math.min(limit, candidates.length));
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildPlan(prefs) {
  const selected = [];
  const usedTitles = new Set();

  meals.forEach((meal, mealIndex) => {
    const quickRecipes = recipeBank.filter((recipe) => recipe.meal === meal && isQuickPrep(recipe));
    const mealRecipes = quickRecipes.length > 0
      ? quickRecipes
      : starterRecipeBank.filter((recipe) => recipe.meal === meal && isQuickPrep(recipe));
    const preferredRecipes = mealRecipes.filter((recipe) => matchesPreference(recipe, prefs.preference));
    const uniqueRecipes = (preferredRecipes.length > 0 ? preferredRecipes : mealRecipes)
      .filter((recipe) => !usedTitles.has(recipe.title.toLowerCase()));
    const freshRecipes = uniqueRecipes.filter((recipe) => !recentRecipeIds.includes(recipe.id));
    const candidateRecipes = freshRecipes.length > 0
      ? freshRecipes
      : uniqueRecipes.length > 0
        ? uniqueRecipes
        : (preferredRecipes.length > 0 ? preferredRecipes : mealRecipes);
    const candidates = candidateRecipes
      .map((recipe) => ({
        recipe,
        score: scoreRecipe(recipe, prefs, mealIndex)
      }))
      .sort((a, b) => b.score - a.score);

    const selectedMeal = { ...chooseFromTop(candidates, 8).recipe, servings: prefs.people * prepDays };
    usedTitles.add(selectedMeal.title.toLowerCase());
    selected.push(selectedMeal);
  });

  const estimated = selected.reduce((sum, item) => sum + item.cost * prefs.people * prepDays, 0);

  if (estimated > prefs.budget) {
    return selected
      .map((item) => {
        if (item.cost <= 4.2) return item;
        const cheaper = recipeBank
          .filter((recipe) => recipe.meal === item.meal && recipe.cost < item.cost && isQuickPrep(recipe))
          .filter((recipe) => matchesPreference(recipe, prefs.preference))
          .sort((a, b) => a.cost - b.cost)[0];
        return cheaper ? { ...item, ...cheaper, servings: prefs.people * prepDays } : item;
      });
  }

  return selected;
}

function rememberRecentRecipes(plan) {
  const ids = plan.map((item) => item.id).filter(Boolean);
  recentRecipeIds = [...ids, ...recentRecipeIds.filter((id) => !ids.includes(id))].slice(0, 12);
}

function buildGroceries(plan, prefs) {
  const groceries = new Map();

  plan.forEach((recipe) => {
    recipe.ingredients.forEach(([name, amount, unit, category]) => {
      const key = `${category}:${name}:${unit}`;
      const existing = groceries.get(key) || { name, amount: 0, unit, category };
      existing.amount += amount * prefs.people * prepDays;
      groceries.set(key, existing);
    });
  });

  return groceries;
}

function mergeRecipes(recipes) {
  const existingIds = new Set(recipeBank.map((recipe) => recipe.id));
  const additions = recipes.filter((recipe) => !existingIds.has(recipe.id));
  recipeBank = [...recipeBank, ...additions];
}

function replacementCandidates(meal, currentId, prefs) {
  const quickRecipes = recipeBank
    .filter((recipe) => recipe.meal === meal && recipe.id !== currentId && isQuickPrep(recipe));
  const preferredRecipes = quickRecipes.filter((recipe) => matchesPreference(recipe, prefs.preference));
  const candidates = preferredRecipes.length > 0 ? preferredRecipes : quickRecipes;
  const mealIndex = meals.indexOf(meal);

  return candidates
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, prefs, mealIndex)
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ recipe }) => ({ ...recipe, servings: prefs.people * prepDays }));
}

function refreshDependentViews(prefs) {
  currentGroceries = buildGroceries(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  generateMealInstructions(prefs);
  generatePrepTips(prefs);
}

async function fetchMoreRecipes(prefs) {
  if (location.protocol === "file:") return;

  const response = await fetch(`/api/recipes?preference=${encodeURIComponent(prefs.preference)}`);
  if (!response.ok) {
    throw new Error(`Recipe API returned ${response.status}`);
  }

  const recipes = await response.json();
  if (Array.isArray(recipes)) {
    mergeRecipes(recipes);
  }
}

async function swapMeal(item, button) {
  const prefs = getPreferences();
  button.disabled = true;
  button.textContent = "Finding another...";

  try {
    let candidates = replacementCandidates(item.meal, item.id, prefs);

    if (candidates.length === 0) {
      await fetchMoreRecipes(prefs);
      candidates = replacementCandidates(item.meal, item.id, prefs);
    }

    if (candidates.length === 0) {
      button.textContent = `No more quick ${item.meal.toLowerCase()} ideas`;
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = `Pick a different ${item.meal.toLowerCase()}`;
      }, 1600);
      return;
    }

    const currentIndex = currentPlan.findIndex((meal) => meal.id === item.id);
    if (currentIndex !== -1) {
      currentPlan[currentIndex] = chooseFromTop(candidates, 6);
      refreshDependentViews(prefs);
      renderPlan(currentPlan, prefs);
    }
  } catch (error) {
    console.error(error);
    button.textContent = "Try again";
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = `Pick a different ${item.meal.toLowerCase()}`;
    }, 1600);
  }
}

function renderPrepTips(tips, loadingMessage = "") {
  if (!prepTipsPanel || !prepTipsContent) return;

  if (!tips && !loadingMessage) {
    prepTipsPanel.hidden = true;
    prepTipsContent.innerHTML = "";
    return;
  }

  prepTipsPanel.hidden = false;

  if (loadingMessage) {
    prepTipsContent.innerHTML = `<p class="prep-loading">${loadingMessage}</p>`;
    return;
  }

  prepTipsContent.innerHTML = [
    ["Prep order", tips.prepOrder],
    ["Time savers", tips.timeSavers],
    ["Easy swaps", tips.substitutions]
  ]
    .map(([title, items]) => `
      <article>
        <h4>${title}</h4>
        <ul>
          ${(Array.isArray(items) ? items : []).map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </article>
    `)
    .join("");
}

async function generatePrepTips(prefs) {
  if (location.protocol === "file:" || currentPlan.length === 0) return;

  const tipsId = ++activeTipsId;
  renderPrepTips(null, "Building fast prep tips...");

  try {
    const response = await fetch("/api/ai/prep-tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        preferences: prefs,
        meals: currentPlan
      })
    });

    if (!response.ok) {
      throw new Error(`Prep tips API returned ${response.status}`);
    }

    const tips = await response.json();
    if (tipsId === activeTipsId) {
      renderPrepTips(tips);
    }
  } catch (error) {
    console.error(error);
    if (tipsId === activeTipsId) {
      renderPrepTips(null);
    }
  }
}

function renderMealInstructions(node, item) {
  const container = node.querySelector(".meal-instructions");
  if (!container) return;

  const instructions = Array.isArray(item.instructions) ? item.instructions : [];
  const storage = item.storage || "";
  const reheating = item.reheating || "";

  if (item.instructionsLoading) {
    container.innerHTML = `
      <h4>Instructions</h4>
      <p class="instruction-status">Building recipe steps...</p>
    `;
    return;
  }

  if (instructions.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h4>Instructions</h4>
    <ol>
      ${instructions.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
    </ol>
    <p class="instruction-note"><strong>Store:</strong> ${escapeHtml(storage)}</p>
    <p class="instruction-note"><strong>Reheat:</strong> ${escapeHtml(reheating)}</p>
  `;
}

async function generateMealInstructions(prefs) {
  if (location.protocol === "file:" || currentPlan.length === 0) return;

  const instructionsId = ++activeInstructionsId;
  currentPlan = currentPlan.map((meal) => ({
    ...meal,
    instructionsLoading: true,
    instructions: [],
    storage: "",
    reheating: ""
  }));
  renderPlan(currentPlan, prefs);

  try {
    const response = await fetch("/api/ai/meal-instructions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        preferences: prefs,
        meals: currentPlan
      })
    });

    if (!response.ok) {
      throw new Error(`Meal instructions API returned ${response.status}`);
    }

    const data = await response.json();
    const byId = new Map(
      (Array.isArray(data.mealInstructions) ? data.mealInstructions : [])
        .map((item) => [item.id, item])
    );

    if (instructionsId !== activeInstructionsId) {
      return;
    }

    currentPlan = currentPlan.map((meal) => {
      const generated = byId.get(meal.id);
      return {
        ...meal,
        instructionsLoading: false,
        instructions: Array.isArray(generated?.instructions) ? generated.instructions : [],
        storage: generated?.storage || "",
        reheating: generated?.reheating || ""
      };
    });
    renderPlan(currentPlan, prefs);
  } catch (error) {
    console.error(error);
    if (instructionsId !== activeInstructionsId) {
      return;
    }

    currentPlan = currentPlan.map((meal) => ({ ...meal, instructionsLoading: false }));
    renderPlan(currentPlan, prefs);
  }
}

function renderPlan(plan, prefs) {
  const template = document.querySelector("#meal-card-template");
  mealGrid.innerHTML = "";

  plan.forEach((item) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const image = node.querySelector("img");
    image.src = item.image;
    image.alt = item.title;
    image.onerror = () => {
      image.onerror = null;
      image.src = fallbackImage(item.title);
    };
    node.querySelector(".meal-meta").innerHTML = `<span>${item.meal}</span><span>${dollars(item.cost * prefs.people * prepDays)}</span>`;
    node.querySelector("h3").textContent = item.title;
    node.querySelector("p").textContent = item.summary;
    const favoriteButton = node.querySelector(".favorite-action");
    const saved = isFavorite(item.id);
    favoriteButton.textContent = saved ? "Saved favorite" : "Save favorite";
    favoriteButton.setAttribute("aria-pressed", String(saved));
    favoriteButton.addEventListener("click", () => toggleFavorite(item));
    node.querySelector(".meal-ingredients").innerHTML = item.ingredients
      .map(([name, amount, unit]) => `<li>${name} ${formatAmount(amount * prefs.people * prepDays)} ${unit}</li>`)
      .join("");
    renderMealInstructions(node, item);
    node.querySelector(".chip-row").innerHTML = [
      `${item.servings} servings`,
      `${item.minutes} min prep`,
      `${item.protein}g protein`,
      item.source
    ]
      .map((chip) => `<span class="chip">${chip}</span>`)
      .join("");
    const swapButton = node.querySelector(".swap-meal-action");
    swapButton.textContent = `Pick a different ${item.meal.toLowerCase()}`;
    swapButton.addEventListener("click", () => swapMeal(item, swapButton));
    mealGrid.appendChild(node);
  });
}

function renderGroceries(groceries) {
  const groups = Array.from(groceries.values()).reduce((acc, item) => {
    acc[item.category] ||= [];
    acc[item.category].push(item);
    return acc;
  }, {});

  groceryList.innerHTML = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => {
      const lis = items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => {
          const nutrition = ingredientNutrition.get(item.name.toLowerCase());
          const nutritionText = nutrition?.match
            ? `<small>${nutrition.match}: ${nutrition.nutrients.calories ?? "-"} cal, ${nutrition.nutrients.protein ?? "-"}g protein</small>`
            : "";

          return `
            <li>
              <span><span class="grocery-item-name">${item.name}</span>${nutritionText}</span>
              <strong>${formatAmount(item.amount)} ${item.unit}</strong>
            </li>
          `;
        })
        .join("");
      return `<article class="grocery-group"><h3>${titleCase(category)}</h3><ul class="grocery-items">${lis}</ul></article>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function enrichGroceries() {
  if (location.protocol === "file:" || currentGroceries.size === 0) return;

  const ingredients = Array.from(currentGroceries.values())
    .filter((item) => !ingredientNutrition.has(item.name.toLowerCase()))
    .slice(0, 12)
    .map((item) => ({ name: item.name }));

  if (ingredients.length === 0) return;

  try {
    const response = await fetch("/api/ingredients/normalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ingredients })
    });

    if (!response.ok) {
      throw new Error(`Ingredient API returned ${response.status}`);
    }

    const results = await response.json();
    results.filter(Boolean).forEach((result) => {
      ingredientNutrition.set(result.name.toLowerCase(), result);
    });

    renderGroceries(currentGroceries);
  } catch (error) {
    console.error(error);
  }
}

async function loadNearbyStores(zip) {
  if (location.protocol === "file:") {
    return null;
  }

  const response = await fetch(`/api/stores?zip=${encodeURIComponent(zip)}`);
  if (!response.ok) {
    throw new Error(`Store API returned ${response.status}`);
  }

  return response.json();
}

async function renderStores(plan, prefs) {
  const storesId = ++activeStoresId;
  const baseCost = plan.reduce((sum, meal) => sum + meal.cost * prefs.people * prepDays, 0);
  let storeSource = {
    context: `ZIP ${prefs.zip} - showing starter estimates until nearby stores load.`,
    stores: fallbackStores
  };

  storeContext.textContent = storeSource.context;
  storeList.innerHTML = `<p class="empty-state">Finding nearby grocery stores...</p>`;

  try {
    const nearby = await loadNearbyStores(prefs.zip);
    if (storesId !== activeStoresId) return;

    if (nearby?.stores?.length) {
      storeSource = {
        context: `${nearby.location?.label || `ZIP ${prefs.zip}`} - Google Places finds nearby stores only. Basket totals are app estimates, not Google Maps prices.`,
        stores: nearby.stores
      };
    } else {
      storeSource.context = `ZIP ${prefs.zip} - no nearby grocery stores returned, showing starter estimates.`;
    }
  } catch (error) {
    console.error(error);
    if (storesId !== activeStoresId) return;
    storeSource.context = `ZIP ${prefs.zip} - nearby stores could not be loaded, showing starter estimates.`;
  }

  const ranked = storeSource.stores
    .map((store) => ({
      ...store,
      total: baseCost * store.multiplier
    }))
    .sort((a, b) => a.total - b.total);

  storeContext.textContent = storeSource.context;
  storeList.innerHTML = ranked
    .map((store, index) => {
      const savings = ranked[ranked.length - 1].total - store.total;
      const details = [
        store.distance,
        store.address,
        store.rating ? `${store.rating} stars` : "",
        store.openNow === true ? "open now" : store.openNow === false ? "closed now" : "",
        store.coverage
      ].filter(Boolean).map(escapeHtml).join(" - ");

      return `
        <article class="store-card">
          <div>
            <h3>${escapeHtml(store.name)}</h3>
            <p class="store-address">${escapeHtml(store.address || "Address unavailable")}</p>
            <p>${details}</p>
            <span class="badge ${index === 0 ? "best" : ""}">${index === 0 ? "Best basket" : `${dollars(savings)} vs highest`}</span>
          </div>
          <div class="store-price">
            <strong>${dollars(store.total)}</strong>
            <span>estimated 5-day basket</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderInstacartProducts(products) {
  if (!instacartProducts) return;

  if (!Array.isArray(products) || products.length === 0) {
    instacartProducts.innerHTML = `<p class="empty-state">No Instacart products returned.</p>`;
    return;
  }

  instacartProducts.innerHTML = products
    .map((product, index) => `
      <article class="instacart-product">
        <a href="${escapeHtml(product.url)}" target="_blank" rel="noreferrer">
          ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />` : ""}
          <span>
            <strong>${escapeHtml(product.name)}</strong>
            <small>${escapeHtml([product.size, product.price].filter(Boolean).join(" - ") || "View on Instacart")}</small>
          </span>
        </a>
        <button class="instacart-detail-action" type="button" data-product-index="${index}">Load details</button>
        <div class="instacart-detail" data-product-detail="${index}"></div>
      </article>
    `)
    .join("");

  instacartProducts.querySelectorAll(".instacart-detail-action").forEach((button) => {
    button.addEventListener("click", () => loadInstacartProductDetail(products[Number(button.dataset.productIndex)], button));
  });
}

async function loadInstacartProductDetail(product, button) {
  if (!product?.url || !instacartProducts) return;

  const detail = instacartProducts.querySelector(`[data-product-detail="${button.dataset.productIndex}"]`);
  button.disabled = true;
  button.textContent = "Loading details...";
  if (detail) {
    detail.innerHTML = `<p class="empty-state">Instacart is fetching this product. This can take a minute.</p>`;
  }

  try {
    const response = await fetch("/api/instacart/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: product.url })
    });

    if (!response.ok) {
      throw new Error(`Instacart product API returned ${response.status}`);
    }

    const data = await response.json();
    if (detail) {
      detail.innerHTML = `
        <dl>
          ${data.brand ? `<div><dt>Brand</dt><dd>${escapeHtml(data.brand)}</dd></div>` : ""}
          ${data.price ? `<div><dt>Price</dt><dd>${escapeHtml(data.price)}</dd></div>` : ""}
          ${data.category ? `<div><dt>Category</dt><dd>${escapeHtml(data.category)}</dd></div>` : ""}
          ${data.productInfo ? `<div><dt>Info</dt><dd>${escapeHtml(data.productInfo)}</dd></div>` : ""}
        </dl>
      `;
    }
    button.textContent = "Refresh details";
  } catch (error) {
    console.error(error);
    if (detail) {
      detail.innerHTML = `<p class="empty-state">Product details could not be loaded.</p>`;
    }
    button.textContent = "Try details again";
  } finally {
    button.disabled = false;
  }
}

async function loadInstacartProducts() {
  if (!loadInstacartProductsButton || !instacartProducts) return;

  loadInstacartProductsButton.disabled = true;
  loadInstacartProductsButton.textContent = "Loading Instacart...";
  instacartProducts.innerHTML = `<p class="empty-state">Instacart is fetching live product listings. This can take a minute.</p>`;

  try {
    const response = await fetch("/api/instacart/products");
    if (!response.ok) {
      throw new Error(`Instacart API returned ${response.status}`);
    }

    renderInstacartProducts(await response.json());
    loadInstacartProductsButton.textContent = "Refresh Instacart products";
  } catch (error) {
    console.error(error);
    instacartProducts.innerHTML = `<p class="empty-state">Instacart products could not be loaded.</p>`;
    loadInstacartProductsButton.textContent = "Try Instacart again";
  } finally {
    loadInstacartProductsButton.disabled = false;
  }
}

function formatAmount(amount) {
  const rounded = Math.round(amount * 4) / 4;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2)).replace(/0$/, "");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function rerender(options = {}) {
  const renderId = ++activeRenderId;
  const prefs = getPreferences();

  if (options.loadRecipes) {
    hasBuiltPlan = false;
    clearPlanViews("Loading quick recipes...");
    await loadRealRecipes(prefs, renderId);
  }

  if (renderId !== activeRenderId) {
    return;
  }

  currentPlan = buildPlan(prefs);
  rememberRecentRecipes(currentPlan);
  currentGroceries = buildGroceries(currentPlan, prefs);

  renderPlan(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  generateMealInstructions(prefs);
  generatePrepTips(prefs);
  hasBuiltPlan = true;
}

function showPage(pageId) {
  if (!hasBuiltPlan && pageId !== "setup") {
    clearPlanViews("Build a meal prep plan to see quick recipe results.");
  }

  document.querySelectorAll(".step").forEach((step) => {
    step.classList.toggle("is-active", step.dataset.page === pageId);
  });
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("is-active", page.id === pageId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".step").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-page-link]").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.pageLink);
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await rerender({ loadRecipes: true });
  showPage("meals");
});

copyButton.addEventListener("click", async () => {
  const text = Array.from(currentGroceries.values())
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    .map((item) => `${formatAmount(item.amount)} ${item.unit} ${item.name}`)
    .join("\n");

  await navigator.clipboard.writeText(text);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy list";
  }, 1400);
});

if (loadInstacartProductsButton) {
  loadInstacartProductsButton.addEventListener("click", loadInstacartProducts);
}

setRecipeStatus("Build a meal prep plan to load quick Spoonacular recipes.");
clearPlanViews("");

const recipeBank = [
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

const stores = [
  { name: "Kroger", distance: "1.4 mi", multiplier: 0.98, coverage: "retailer API candidate" },
  { name: "ALDI", distance: "2.1 mi", multiplier: 0.9, coverage: "estimated basket" },
  { name: "Target Grocery", distance: "2.6 mi", multiplier: 1.05, coverage: "retailer feed candidate" },
  { name: "Whole Foods", distance: "3.0 mi", multiplier: 1.24, coverage: "premium estimate" }
];

const meals = ["Breakfast", "Lunch", "Dinner"];
const prepDays = 5;

const form = document.querySelector("#planner-form");
const mealGrid = document.querySelector("#meal-grid");
const groceryList = document.querySelector("#grocery-list");
const storeList = document.querySelector("#store-list");
const storeContext = document.querySelector("#store-context");
const copyButton = document.querySelector("#copy-list");

let currentPlan = [];
let currentGroceries = new Map();
let favoriteMeals = loadFavorites();

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

function buildPlan(prefs) {
  const selected = meals.map((meal, mealIndex) => {
    const mealRecipes = recipeBank.filter((recipe) => recipe.meal === meal);
    const preferredRecipes = mealRecipes.filter((recipe) => matchesPreference(recipe, prefs.preference));
    const candidates = (preferredRecipes.length > 0 ? preferredRecipes : mealRecipes)
      .map((recipe) => ({
        recipe,
        score: scoreRecipe(recipe, prefs, mealIndex)
      }))
      .sort((a, b) => b.score - a.score);

    return { ...candidates[0].recipe, servings: prefs.people * prepDays };
  });

  const estimated = selected.reduce((sum, item) => sum + item.cost * prefs.people * prepDays, 0);

  if (estimated > prefs.budget) {
    return selected
      .map((item) => {
        if (item.cost <= 4.2) return item;
        const cheaper = recipeBank
          .filter((recipe) => recipe.meal === item.meal && recipe.cost < item.cost)
          .filter((recipe) => matchesPreference(recipe, prefs.preference))
          .sort((a, b) => a.cost - b.cost)[0];
        return cheaper ? { ...item, ...cheaper, servings: prefs.people * prepDays } : item;
      });
  }

  return selected;
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
    node.querySelector(".chip-row").innerHTML = [
      `${item.servings} servings`,
      `${item.minutes} min prep`,
      `${item.protein}g protein`,
      item.source
    ]
      .map((chip) => `<span class="chip">${chip}</span>`)
      .join("");
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
        .map((item) => `<li><span>${item.name}</span><strong>${formatAmount(item.amount)} ${item.unit}</strong></li>`)
        .join("");
      return `<article class="grocery-group"><h3>${titleCase(category)}</h3><ul class="grocery-items">${lis}</ul></article>`;
    })
    .join("");
}

function renderStores(plan, prefs) {
  const baseCost = plan.reduce((sum, meal) => sum + meal.cost * prefs.people * prepDays, 0);
  const ranked = stores
    .map((store) => ({
      ...store,
      total: baseCost * store.multiplier
    }))
    .sort((a, b) => a.total - b.total);

  storeContext.textContent = `ZIP ${prefs.zip} - prices are estimates until retailer APIs are connected.`;
  storeList.innerHTML = ranked
    .map((store, index) => {
      const savings = ranked[ranked.length - 1].total - store.total;
      return `
        <article class="store-card">
          <div>
            <h3>${store.name}</h3>
            <p>${store.distance} - ${store.coverage}</p>
            <span class="badge ${index === 0 ? "best" : ""}">${index === 0 ? "Best basket" : `${dollars(savings)} vs highest`}</span>
          </div>
          <div class="store-price">
            <strong>${dollars(store.total)}</strong>
            <span>5-day basket</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function formatAmount(amount) {
  const rounded = Math.round(amount * 4) / 4;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2)).replace(/0$/, "");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function rerender() {
  const prefs = getPreferences();
  currentPlan = buildPlan(prefs);
  currentGroceries = buildGroceries(currentPlan, prefs);

  renderPlan(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
}

function showPage(pageId) {
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  rerender();
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

rerender();

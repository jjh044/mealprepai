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
    id: "cheesy-baked-eggs",
    meal: "Breakfast",
    title: "Cheesy Baked Eggs",
    summary: "Baked eggs with cheddar and Parmesan cooked until just set.",
    cost: 2.5,
    minutes: 20,
    protein: 22,
    tags: ["quick", "family", "balanced", "high-protein", "high-protein-low-carb", "vegetarian"],
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
    id: "cottage-toast",
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
    id: "chia-protein-pudding",
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
    id: "greek-yogurt-breakfast-bowl",
    meal: "Breakfast",
    title: "Greek Yogurt Breakfast Bowl",
    summary: "Greek yogurt, banana, berries, oats, and walnuts assembled in minutes.",
    cost: 2.45,
    minutes: 5,
    protein: 25,
    tags: ["quick", "balanced", "vegetarian", "gluten-free", "high-protein"],
    provider: "YouTube + AI",
    source: "Jalalsamfit",
    sourceUrl: "https://www.youtube.com/watch?v=W8eJV0CfUu0",
    image: "https://i.ytimg.com/vi/W8eJV0CfUu0/hqdefault.jpg",
    ingredients: [
      ["Greek yogurt", 0.75, "cup", "dairy"],
      ["banana", 0.5, "each", "produce"],
      ["frozen berries", 0.5, "cup", "frozen"],
      ["rolled oats", 0.25, "cup", "pantry"],
      ["walnuts", 1, "tbsp", "pantry"]
    ]
  },
  {
    id: "chicken-rice",
    meal: "Lunch",
    title: "Chicken Cauliflower Rice Bowl",
    summary: "Chicken and cauliflower rice bowls topped with carrots, tomatoes, red onion, and greens.",
    cost: 4.5,
    minutes: 25,
    protein: 41,
    tags: ["balanced", "batch", "family", "leftovers", "high-protein", "high-protein-low-carb", "gluten-free"],
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
    id: "turkey-chili",
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
    id: "chickpea-salad",
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
    id: "tuna-pasta",
    meal: "Lunch",
    title: "Tuna Pasta Salad",
    summary: "Budget pantry pasta with tuna, peas, lemon, and yogurt dressing.",
    cost: 3.25,
    minutes: 18,
    protein: 31,
    tags: ["quick", "balanced", "family", "high-protein"],
    provider: "YouTube + AI",
    source: "Clean & Delicious",
    sourceUrl: "https://www.youtube.com/watch?v=U4zIqtNWhYY",
    image: "https://i.ytimg.com/vi/U4zIqtNWhYY/hqdefault.jpg",
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
    id: "sheet-pan-sausage",
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
    id: "tofu-noodles",
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
    id: "beef-tacos",
    meal: "Dinner",
    title: "Skillet Beef Taco Bowls",
    summary: "Ground beef, beans, rice, salsa, lettuce, and cheese.",
    cost: 4.75,
    minutes: 24,
    protein: 34,
    tags: ["quick", "family", "leftovers", "high-protein", "gluten-free"],
    provider: "YouTube + AI",
    source: "Chef Jack Ovens",
    sourceUrl: "https://www.youtube.com/watch?v=IqgqMNJlQbk",
    image: "https://i.ytimg.com/vi/IqgqMNJlQbk/hqdefault.jpg",
    ingredients: [
      ["ground beef", 0.3, "lb", "meat"],
      ["rice", 0.5, "cup", "pantry"],
      ["black beans", 0.5, "can", "pantry"],
      ["romaine", 1, "cup", "produce"],
      ["shredded cheese", 0.25, "cup", "dairy"]
    ]
  },
  {
    id: "stuffed-pepper-skillet",
    meal: "Dinner",
    title: "Stuffed Pepper Skillet",
    summary: "An unstuffed pepper skillet with ground beef, cauliflower rice, vegetables, and cheese.",
    cost: 4.5,
    minutes: 30,
    protein: 36,
    tags: ["balanced", "family", "high-protein", "high-protein-low-carb", "gluten-free"],
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
    id: "lentil-curry",
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
  }
].map((recipe) => ({
  ...recipe,
  image: recipe.image || starterRecipeThumbnail(recipe)
}));

const YOUTUBE_PROVIDER = "YouTube + AI";
const YOUTUBE_RECIPE_SHARE = 0.75;
const MIN_PROVIDER_ROTATION_CANDIDATES = 6;
const SELECTION_POOL_SIZE = 16;
const RECENT_RECIPE_MEMORY = 36;
const STORAGE_KEYS = {
  favorites: "prepwise-favorites",
  history: "prepwise-plan-history",
  plan: "prepwise-current-plan",
  preferences: "prepwise-preferences"
};
const DEFAULT_REQUEST_TIMEOUT_MS = 15000;
const subscriptionManager = window.PrepWiseSubscription.createSubscriptionManager({
  storage: window.localStorage
});
const storeAdapter = window.PrepWiseStore.createStoreAdapter();
document.body.classList.toggle("storekit-native", storeAdapter.isNative);
if (!storeAdapter.isNative) subscriptionManager.clearDemo();

function applyTestingUrlActions() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("resetTesting")) return;

  localStorage.removeItem(window.PrepWiseSubscription.STORAGE_KEYS.usage);
  params.delete("resetTesting");

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || "#setup"}`;
  window.history.replaceState(window.history.state, "", nextUrl);
}

applyTestingUrlActions();
let appConfig = window.PrepWiseAppConfig || {};
let appConfigPromise = null;

let recipeBank = [...starterRecipeBank];

const meals = ["Breakfast", "Lunch", "Dinner"];
const prepDays = 5;

const form = document.querySelector("#planner-form");
const createPlanButton = document.querySelector("#create-plan-button");
const createPlanButtonLabel = createPlanButton?.querySelector(".button-label");
const createPlanButtonArrow = createPlanButton?.querySelector(".button-arrow");
const planLoadingStatus = document.querySelector("#plan-loading-status");
const mealGrid = document.querySelector("#meal-grid");
const groceryList = document.querySelector("#grocery-list");
const storeList = document.querySelector("#store-list");
const storeContext = document.querySelector("#store-context");
const copyButton = document.querySelector("#copy-list");
const recipeSourceStatus = document.querySelector("#recipe-source-status");
const prepTipsPanel = document.querySelector("#prep-tips-panel");
const prepTipsContent = document.querySelector("#prep-tips-content");
const subscriptionButton = document.querySelector("#subscription-button");
const subscriptionLabel = document.querySelector("#subscription-label");
const subscriptionDetail = document.querySelector("#subscription-detail");
const usageBanner = document.querySelector("#usage-banner");
const paywallDialog = document.querySelector("#paywall-dialog");
const paywallReason = document.querySelector("#paywall-reason");
const purchaseStatus = document.querySelector("#purchase-status");
const restorePurchasesButton = document.querySelector("#restore-purchases");
const manageDemoSubscriptionButton = document.querySelector("#manage-demo-subscription");
const manageSubscriptionButton = document.querySelector("#manage-subscription");
const planHistoryPanel = document.querySelector("#plan-history-panel");
const planHistoryList = document.querySelector("#plan-history-list");
const accountSubscriptionStatus = document.querySelector("#account-subscription-status");
const accountRenewalStatus = document.querySelector("#account-renewal-status");
const accountUpgradeButton = document.querySelector("#account-upgrade");
const accountRestoreButton = document.querySelector("#account-restore");
const accountManageSubscriptionButton = document.querySelector("#account-manage-subscription");
const accountProfileStatus = document.querySelector("#account-profile-status");
const accountSignInButton = document.querySelector("#account-sign-in");
const accountCreateButton = document.querySelector("#account-create");
const signOutButton = document.querySelector("#sign-out");
const deleteAccountButton = document.querySelector("#delete-account");
const accountActionStatus = document.querySelector("#account-action-status");
const renewalDisclosure = document.querySelector("#renewal-disclosure");

let currentPlan = [];
let currentGroceries = new Map();
let favoriteMeals = loadFavorites();
let lastRecipePreference = "";
let activeRenderId = 0;
let hasBuiltPlan = false;
let isCreatingPlan = false;
let ingredientNutrition = new Map();
let activeTipsId = 0;
let activeStoresId = 0;
let activeInstructionsId = 0;
let recentRecipeIds = [];
let previousPlanRecipeIds = new Set();
let restoredCloudAccount = false;
let lastTrackedSubscriptionState = "";
let activePageId = "setup";
let paywallReturnFocus = null;

document.body.classList.toggle("native-store-build", storeAdapter.isNative);
document.body.classList.toggle("native-ios-store", storeAdapter.platform === "ios");
document.body.classList.toggle("native-android-store", storeAdapter.platform === "android");
if (storeAdapter.platform === "ios") {
  renewalDisclosure.textContent =
    "Payment is charged to your Apple Account after confirmation. Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel in Apple subscription settings.";
} else if (storeAdapter.platform === "android") {
  renewalDisclosure.textContent =
    "Payment is charged to your Google Play account after confirmation. Subscriptions renew automatically unless cancelled before the end of the current billing period. Manage or cancel in Google Play subscriptions.";
}

function track(event, properties = {}) {
  window.PrepWiseTelemetry?.capture?.(event, properties);
}

function reportError(error, context = {}) {
  window.PrepWiseTelemetry?.captureException?.(error, context);
}

function referralPayload() {
  try {
    return window.PrepWiseReferral?.referralRequestPayload?.(window.localStorage) || null;
  } catch {
    return null;
  }
}

function referralCode() {
  return referralPayload()?.code || null;
}
let nativeBillingContext = null;
let cloudState = window.PrepWiseCloud?.getState?.() || {
  ready: false,
  authenticated: false,
  loading: true,
  data: null
};

function finiteRemaining(value) {
  return Number.isFinite(value) ? value : "Unlimited";
}

function isDevBillingBypassEnabled() {
  return appConfig.devBillingBypass === true;
}

async function loadAppConfig() {
  if (appConfigPromise) return appConfigPromise;
  appConfigPromise = fetch(`${window.PrepWiseApiOrigin || ""}/api/config`)
    .then((response) => response.json())
    .then((config) => {
      appConfig = config || {};
      window.PrepWiseAppConfig = appConfig;
      if (isDevBillingBypassEnabled() && !storeAdapter.isNative && !subscriptionManager.isPro()) {
        subscriptionManager.activateDemo(window.PrepWiseSubscription.PRODUCTS.yearly.id);
      }
      updateSubscriptionUi();
      return appConfig;
    })
    .catch((error) => {
      console.warn("Could not load app configuration", error);
      return appConfig;
    });
  return appConfigPromise;
}

window.addEventListener("prepwise:config", (event) => {
  appConfig = event.detail || {};
  if (isDevBillingBypassEnabled() && !storeAdapter.isNative && !subscriptionManager.isPro()) {
    subscriptionManager.activateDemo(window.PrepWiseSubscription.PRODUCTS.yearly.id);
  }
  updateSubscriptionUi();
});
loadAppConfig();

function updateSubscriptionUi() {
  if (cloudState.authenticated && cloudState.data && !isDevBillingBypassEnabled()) {
    const status = cloudState.data;
    const subscription = status.subscription;
    document.body.classList.toggle("is-pro", status.isPro);
    subscriptionLabel.textContent = status.isPro ? "PrepWise Pro" : "Free plan";
    subscriptionDetail.textContent = status.isPro ? "Unlimited access" : "Weekly limits";
    accountProfileStatus.textContent = status.user.email || "Signed-in account";
    accountSubscriptionStatus.textContent = status.isPro ? `PrepWise Pro (${subscription?.status || "active"})` : "Free";
    accountRenewalStatus.textContent = subscription?.currentPeriodEnd
      ? `${subscription.cancelAtPeriodEnd ? "Ends" : "Renews"} ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
      : "Not applicable";
    accountSignInButton.hidden = true;
    accountCreateButton.hidden = true;
    signOutButton.hidden = false;
    usageBanner.innerHTML = status.isPro
      ? `<strong>PrepWise Pro</strong><span>Unlimited plans, swaps, and AI prep help are active.</span>`
      : `
        <strong>Free this week</strong>
        <span>${status.usage.remaining.plans} plans left</span>
        <span>${status.usage.remaining.swaps} swaps left</span>
        <span>${status.usage.remaining.ai} AI assist left</span>
        <button type="button" data-open-paywall="usage">Upgrade</button>
      `;
    usageBanner.querySelector("[data-open-paywall]")?.addEventListener("click", () => {
      openPaywall("Upgrade for unlimited weekly usage.");
    });
    renderPlanHistory();
    return;
  }

  const status = subscriptionManager.status();
  document.body.classList.toggle("is-pro", status.isPro);
  subscriptionLabel.textContent = status.isPro ? "PrepWise Pro" : "Free plan";
  subscriptionDetail.textContent = status.isPro ? "Unlimited access" : "Weekly limits";
  manageDemoSubscriptionButton.hidden = status.entitlement.source !== "local-demo";
  accountSubscriptionStatus.textContent = status.isPro
    ? `PrepWise Pro (${status.entitlement.state || "active"})`
    : "Free";
  accountRenewalStatus.textContent = subscriptionRenewalText(status.entitlement);
  accountProfileStatus.textContent = "Local guest profile";
  accountSignInButton.hidden = false;
  accountCreateButton.hidden = false;
  signOutButton.hidden = true;
  renderPlanHistory();

  if (status.isPro) {
    usageBanner.innerHTML = `
      <strong>PrepWise Pro</strong>
      <span>Unlimited plans, swaps, and AI prep help are active.</span>
    `;
    return;
  }

  usageBanner.innerHTML = `
    <strong>Free this week</strong>
    <span>${finiteRemaining(status.remaining.plans)} plans left</span>
    <span>${finiteRemaining(status.remaining.swaps)} swaps left</span>
    <span>${finiteRemaining(status.remaining.ai)} AI assist left</span>
    <button type="button" data-open-paywall="usage">Upgrade</button>
  `;
  usageBanner.querySelector("[data-open-paywall]")?.addEventListener("click", () => {
    openPaywall("Upgrade for unlimited weekly usage.");
  });
}

function subscriptionRenewalText(entitlement) {
  if (!entitlement?.active) {
    if (entitlement?.state === "expired") return "Expired";
    if (entitlement?.state === "refunded") return "Refunded";
    if (entitlement?.state === "revoked") return "Revoked";
    return "Not applicable";
  }
  if (entitlement.state === "grace_period") return "Billing grace period";
  if (entitlement.state === "billing_retry") return "Billing retry";
  if (entitlement.expiresAt) return `Renews or expires ${new Date(entitlement.expiresAt).toLocaleDateString()}`;
  return entitlement.source === "local-demo" ? "Local demo only" : "Active";
}

async function loadStoreProducts() {
  if (!storeAdapter.isNative) return;
  try {
    const products = await storeAdapter.loadProducts();
    products.forEach((product) => {
      const price = document.querySelector(`[data-product-price="${product.id}"]`);
      const detail = document.querySelector(`[data-product-detail="${product.id}"]`);
      if (!price || !detail) return;

      price.textContent = product.displayPrice || (storeAdapter.isNative ? "Unavailable" : "Local demo");
      const trialText = product.trial?.displayText ? `${product.trial.displayText}, then ` : "";
      detail.textContent = `${trialText}${product.displayPrice || "Store price"} per ${product.period}`;
    });
  } catch (error) {
    console.error("Could not load app-store products", error);
    purchaseStatus.textContent = "Subscription products are unavailable. Please try again later.";
  }
}

function purchaseMessage(result) {
  const messages = {
    success: "PrepWise Pro is active.",
    restored: "Your PrepWise Pro purchase was restored.",
    pending: "Purchase is pending approval or payment confirmation.",
    cancelled: "Purchase was cancelled. No charge was made.",
    expired: "The subscription has expired.",
    refunded: "The purchase was refunded and Pro access was removed.",
    revoked: "The subscription was revoked and Pro access was removed.",
    billing_retry: "Apple is retrying billing. Pro access remains active for now.",
    grace_period: "The subscription is in a billing grace period.",
    upgraded: "Your PrepWise Pro plan was upgraded.",
    downgraded: "Your plan change will take effect on Apple's scheduled date.",
    verification_required: "The purchase was received and is being verified.",
    unavailable: "App-store billing is unavailable in this build."
  };
  return messages[result?.state] || "Subscription status was updated.";
}

function applyStoreResult(result) {
  if (result?.entitlement) {
    subscriptionManager.applyVerifiedEntitlement(result.entitlement);
  }
  purchaseStatus.textContent = purchaseMessage(result);
  accountActionStatus.textContent = purchaseStatus.textContent;
  updateSubscriptionUi();
}

async function verifyNativeStoreResult(result) {
  if (!result?.verification) {
    if (result?.entitlement) {
      throw new Error("Native store entitlement is missing server verification data.");
    }
    return result;
  }
  const response = await apiFetch("/api/billing/native/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...result.verification,
      appAccountToken: nativeBillingContext?.appAccountToken,
      revenueCatAppUserId: nativeBillingContext?.revenueCatAppUserId,
      referral: referralPayload()
    })
  });
  return response.json();
}

async function loadNativeBillingContext() {
  if (nativeBillingContext?.appAccountToken) return nativeBillingContext;
  const response = await apiFetch("/api/billing/native/context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referral: referralPayload() })
  });
  nativeBillingContext = await response.json();
  return nativeBillingContext;
}

async function purchaseProduct(productId) {
  if (!storeAdapter.isNative) {
    await loadAppConfig();
    if (isDevBillingBypassEnabled()) {
      subscriptionManager.activateDemo(productId);
      purchaseStatus.textContent = "Development billing bypass is active. PrepWise Pro is enabled locally.";
      accountActionStatus.textContent = purchaseStatus.textContent;
      track("development_billing_bypass_activated", { product_id: productId });
      updateSubscriptionUi();
      closePaywall();
      return;
    }
    if (!cloudState.authenticated) {
      track("checkout_blocked", { reason: "authentication_required", product_id: productId });
      closePaywall();
      window.PrepWiseCloud?.openAuth?.("signUp");
      return;
    }
    purchaseStatus.textContent = "Opening secure Stripe checkout...";
    try {
      const plan = productId === "prepwise_pro_yearly" ? "yearly" : "monthly";
      track("stripe_checkout_started", { plan, product_id: productId, referral_code: referralCode() });
      const response = await apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, referral: referralPayload() })
      });
      const result = await response.json();
      window.location.assign(result.url);
    } catch (error) {
      console.error(error);
      reportError(error, { action: "stripe_checkout", product_id: productId });
      track("stripe_checkout_failed", { product_id: productId });
      purchaseStatus.textContent = "Checkout could not be opened.";
    }
    return;
  }

  if (!cloudState.authenticated) {
    closePaywall();
    accountActionStatus.textContent = "Sign in before purchasing so Pro access can be restored across devices.";
    window.PrepWiseCloud?.openAuth?.("signIn");
    return;
  }
  purchaseStatus.textContent = `Confirming purchase with ${storeAdapter.platform === "android" ? "Google Play" : "Apple"}...`;
  try {
    const context = await loadNativeBillingContext();
    applyStoreResult(await verifyNativeStoreResult(await storeAdapter.purchase(productId, context)));
  } catch (error) {
    console.error(error);
    purchaseStatus.textContent = "The purchase was not activated because server verification failed.";
  }
}

async function restorePurchases() {
  if (!storeAdapter.isNative) {
    await loadAppConfig();
    if (isDevBillingBypassEnabled() && !subscriptionManager.isPro()) {
      subscriptionManager.activateDemo(window.PrepWiseSubscription.PRODUCTS.yearly.id);
    }
    applyStoreResult({ state: subscriptionManager.isPro() ? "restored" : "unavailable" });
    return;
  }

  if (!cloudState.authenticated) {
    accountActionStatus.textContent = "Sign in before restoring purchases.";
    window.PrepWiseCloud?.openAuth?.("signIn");
    return;
  }
  purchaseStatus.textContent = "Restoring purchases...";
  try {
    applyStoreResult(await verifyNativeStoreResult(await storeAdapter.restore()));
  } catch (error) {
    console.error(error);
    purchaseStatus.textContent = "Purchases could not be restored.";
  }
}

async function manageSubscriptions() {
  if (!storeAdapter.isNative) {
    await loadAppConfig();
    if (isDevBillingBypassEnabled()) {
      accountActionStatus.textContent = "Development billing bypass is active. No Stripe portal is needed.";
      purchaseStatus.textContent = accountActionStatus.textContent;
      return;
    }
    if (!cloudState.authenticated) {
      window.PrepWiseCloud?.openAuth?.("signIn");
      return;
    }
    try {
      track("subscription_portal_opened");
      const response = await apiFetch("/api/billing/portal", { method: "POST" });
      const result = await response.json();
      window.location.assign(result.url);
    } catch (error) {
      console.error(error);
      accountActionStatus.textContent = "Subscription settings could not be opened.";
    }
    return;
  }
  try {
    const result = await storeAdapter.manageSubscriptions();
    if (result.state === "unavailable") {
      const url = storeAdapter.platform === "android"
        ? "https://play.google.com/store/account/subscriptions"
        : "https://apps.apple.com/account/subscriptions";
      window.open(url, "_blank", "noopener");
      purchaseStatus.textContent = "Opened app-store subscription management.";
      accountActionStatus.textContent = purchaseStatus.textContent;
    }
  } catch (error) {
    console.error(error);
    accountActionStatus.textContent = "Subscription settings could not be opened.";
  }
}

function planWithoutLoadingState(plan) {
  return plan.map(({ instructionsLoading, ...meal }) => meal);
}

function savePlanHistory(prefs) {
  if (cloudState.authenticated && currentPlan.length > 0 && !isDevBillingBypassEnabled()) {
    window.PrepWiseCloud?.savePlan?.(planWithoutLoadingState(currentPlan), prefs)
      ?.catch((error) => console.error("Could not save cloud plan", error));
    return;
  }
  if (!subscriptionManager.isPro() || currentPlan.length === 0) return;

  const history = loadStoredValue(STORAGE_KEYS.history, []);
  const entry = {
    id: `${Date.now()}-${currentPlan.map((meal) => meal.id).join("-")}`,
    savedAt: new Date().toISOString(),
    preferences: prefs,
    plan: planWithoutLoadingState(currentPlan)
  };
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify([entry, ...history].slice(0, 8)));
  renderPlanHistory();
}

function renderPlanHistory() {
  if (!planHistoryPanel || !planHistoryList) return;

  if (cloudState.authenticated && cloudState.data && !isDevBillingBypassEnabled()) {
    const history = cloudState.data.plans || [];
    planHistoryPanel.hidden = history.length === 0;
    planHistoryList.innerHTML = history
      .map((entry) => {
        const mealNames = (entry.plan || []).map((meal) => meal.title).filter(Boolean).join(", ");
        return `
          <article class="plan-history-card">
            <div><strong>${escapeHtml(new Date(entry.createdAt).toLocaleDateString())}</strong><p>${escapeHtml(mealNames)}</p></div>
          </article>
        `;
      })
      .join("");
    return;
  }

  const isPro = subscriptionManager.isPro();
  planHistoryPanel.hidden = !isPro;
  if (!isPro) {
    planHistoryList.innerHTML = "";
    return;
  }

  const history = loadStoredValue(STORAGE_KEYS.history, []);
  if (history.length === 0) {
    planHistoryList.innerHTML = `<p class="empty-state">Build a Pro meal plan to start your history.</p>`;
    return;
  }

  planHistoryList.innerHTML = history
    .map((entry) => {
      const mealNames = (entry.plan || []).map((meal) => meal.title).filter(Boolean).join(", ");
      const savedDate = new Date(entry.savedAt);
      return `
        <article class="plan-history-card">
          <div>
            <strong>${escapeHtml(savedDate.toLocaleDateString())}</strong>
            <p>${escapeHtml(mealNames)}</p>
          </div>
          <button type="button" data-history-id="${escapeHtml(entry.id)}">Restore plan</button>
        </article>
      `;
    })
    .join("");

  planHistoryList.querySelectorAll("[data-history-id]").forEach((button) => {
    button.addEventListener("click", () => restoreHistoryEntry(button.dataset.historyId));
  });
}

function applyPreferences(prefs) {
  if (!prefs) return;

  const budget = document.querySelector("#budget");
  const zip = document.querySelector("#zip");
  const people = document.querySelector("#people");
  const preference = document.querySelector(`input[name="preference"][value="${CSS.escape(String(prefs.preference || ""))}"]`);

  if (Number.isFinite(Number(prefs.budget))) budget.value = String(prefs.budget);
  if (/^\d{5}$/.test(String(prefs.zip || ""))) zip.value = String(prefs.zip);
  if (Number.isFinite(Number(prefs.people))) people.value = String(prefs.people);
  if (preference) preference.checked = true;
}

function restoreHistoryEntry(historyId) {
  const entry = loadStoredValue(STORAGE_KEYS.history, [])
    .find((item) => item.id === historyId);
  if (!entry || !Array.isArray(entry.plan)) return;

  applyPreferences(entry.preferences);
  const prefs = getPreferences();
  currentPlan = refreshPlanAssets(entry.plan);
  currentGroceries = buildGroceries(currentPlan, prefs);
  hasBuiltPlan = true;
  rememberRecentRecipes(currentPlan);
  saveCurrentState(prefs);
  renderPlan(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  setRecipeStatus("Restored a saved PrepWise Pro plan from this device.");
  showPage("meals");
}

function openPaywall(reason) {
  paywallReturnFocus = document.activeElement;
  paywallReason.textContent = reason || "Choose PrepWise Pro for unlimited meal planning.";
  purchaseStatus.textContent = "";
  updateSubscriptionUi();
  track("paywall_viewed", {
    reason: String(reason || "manual").slice(0, 120),
    authenticated: cloudState.authenticated,
  });

  if (typeof paywallDialog.showModal === "function") {
    paywallDialog.showModal();
  } else {
    paywallDialog.setAttribute("open", "");
  }
  paywallDialog.querySelector(".paywall-close")?.focus();
}

function closePaywall() {
  if (paywallDialog.open && typeof paywallDialog.close === "function") {
    paywallDialog.close();
  } else {
    paywallDialog.removeAttribute("open");
  }
  paywallReturnFocus?.focus?.();
  paywallReturnFocus = null;
}

function requireFeature(feature, reason) {
  if (subscriptionManager.canUse(feature)) return true;
  openPaywall(reason);
  return false;
}

async function consumeFeature(feature, reason) {
  await loadAppConfig();
  if (isDevBillingBypassEnabled()) return true;

  if (cloudState.authenticated) {
    try {
      const result = await window.PrepWiseCloud.consumeFeature(feature);
      if (!result?.allowed) {
        track("free_limit_reached", { feature, authenticated: true });
        openPaywall(reason);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Could not verify usage", error);
      reportError(error, { action: "consume_feature", feature });
      openPaywall("We could not verify your account limits. Please try again.");
      return false;
    }
  }
  if (!requireFeature(feature, reason)) {
    track("free_limit_reached", { feature, authenticated: false });
    return false;
  }
  subscriptionManager.consume(feature);
  return true;
}

async function runAiFeatures(prefs) {
  if (location.protocol === "file:" || currentPlan.length === 0) return;

  if (!await consumeFeature("ai", "Your free AI assist has been used for this week.")) {
    renderPrepTips({
      prepOrder: ["Your free AI assist has been used for this week."],
      timeSavers: ["Upgrade to Pro for unlimited prep tips and recipe instructions."],
      substitutions: []
    });
    currentPlan = currentPlan.map((meal) => ({ ...meal, instructionsLoading: false }));
    renderPlan(currentPlan, prefs);
    updateSubscriptionUi();
    return;
  }

  updateSubscriptionUi();
  generateMealInstructions(prefs);
  generatePrepTips(prefs);
}

function dollars(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favoriteMeals));
}

function loadStoredValue(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveCurrentState(prefs) {
  try {
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(prefs));
    localStorage.setItem(
      STORAGE_KEYS.plan,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        plan: planWithoutLoadingState(currentPlan)
      })
    );
  } catch (error) {
    console.error("Could not save the current plan", error);
  }
  if (cloudState.authenticated) {
    window.PrepWiseCloud?.savePreferences?.(prefs)
      ?.catch((error) => console.error("Could not save cloud preferences", error));
  }
}

function refreshRecipeForCurrentAssets(recipe) {
  const bankMatch = recipeBank.find((item) => item.id === recipe.id) ||
    starterRecipeBank.find((item) => item.id === recipe.id) ||
    recipeBank.find((item) => item.title === recipe.title && item.meal === recipe.meal) ||
    starterRecipeBank.find((item) => item.title === recipe.title && item.meal === recipe.meal);

  if (bankMatch) {
    return {
      ...recipe,
      image: bankMatch.image,
      provider: bankMatch.provider || recipe.provider,
      source: bankMatch.source || recipe.source,
      sourceUrl: bankMatch.sourceUrl || recipe.sourceUrl
    };
  }

  return {
    ...recipe,
    image: isTrustedRecipePhoto(recipe) ? recipe.image : starterRecipeThumbnail(recipe)
  };
}

function refreshPlanAssets(plan) {
  return Array.isArray(plan) ? plan.map(refreshRecipeForCurrentAssets) : [];
}

function restorePreferences() {
  const prefs = loadStoredValue(STORAGE_KEYS.preferences, null);
  if (!prefs) return null;

  applyPreferences(prefs);

  return getPreferences();
}

function restoreSavedPlan(prefs) {
  const saved = loadStoredValue(STORAGE_KEYS.plan, null);
  if (!saved || !Array.isArray(saved.plan) || saved.plan.length !== meals.length) return false;

  currentPlan = refreshPlanAssets(saved.plan);
  currentGroceries = buildGroceries(currentPlan, prefs);
  hasBuiltPlan = true;
  rememberRecentRecipes(currentPlan);
  renderPlan(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  setRecipeStatus("Restored your last saved meal plan. Build again for fresh recipe results.");
  return true;
}

async function apiFetch(url, options = {}, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(options.headers || {});
    const token = window.PrepWiseCloud?.getToken?.();
    if (token && String(url).startsWith("/api/")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    const requestUrl = String(url).startsWith("/api/")
      ? `${window.PrepWiseApiOrigin || ""}${url}`
      : url;
    const response = await fetch(requestUrl, { ...options, headers, signal: controller.signal });
    if (!response.ok) {
      let detail = "";
      try {
        const data = await response.json();
        detail = data?.error ? `: ${data.error}` : "";
      } catch {
        detail = "";
      }
      const error = new Error(`Request returned ${response.status}${detail}`);
      reportError(error, {
        action: "api_request",
        method: options.method || "GET",
        path: String(url).split("?")[0],
        status: response.status,
      });
      throw error;
    }
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("Request timed out. Check your connection and try again.");
      reportError(timeoutError, { action: "api_timeout", path: String(url).split("?")[0] });
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
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

function recipeImage(recipe) {
  if (isTrustedRecipePhoto(recipe)) {
    return recipe.image;
  }

  return fallbackImage(recipe.title, recipe);
}

function isTrustedRecipePhoto(recipe = {}) {
  const image = String(recipe.image || "");
  const provider = String(recipe.provider || "");

  if (/^\/assets\/recipe-fallbacks\/(?:breakfast|lunch|dinner)\.jpg$/i.test(image)) return true;
  if (!/^https:\/\//i.test(image)) return false;
  if (provider === YOUTUBE_PROVIDER) return /^https:\/\/i\.ytimg\.com\//i.test(image);
  if (provider === "Spoonacular") return /spoonacular\.com\/recipeImages\//i.test(image);
  if (provider === "Tasty") return /(?:buzzfeed\.com|tasty\.co)/i.test(image);

  return false;
}

function starterRecipeThumbnail(recipe = {}) {
  const meal = ["Breakfast", "Lunch", "Dinner"].includes(recipe.meal) ? recipe.meal : "Lunch";
  return `/assets/recipe-fallbacks/${meal.toLowerCase()}.jpg`;
}

function fallbackImage(title, recipe = {}) {
  return starterRecipeThumbnail({ ...recipe, title });
}

function getPreferences() {
  return {
    budget: Math.min(350, Math.max(35, Number(document.querySelector("#budget").value || 125))),
    zip: document.querySelector("#zip").value.trim(),
    people: Math.min(8, Math.max(1, Number(document.querySelector("#people").value || 1))),
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
    setRecipeStatus("Using curated recipe data. Run the local server to load live recipe APIs.");
    return;
  }

  if (lastRecipePreference === prefs.preference && recipeBank !== starterRecipeBank) {
    return;
  }

  setRecipeStatus("Loading quick recipes from Spoonacular, Tasty, and YouTube...");

  try {
    const response = await apiFetch(`/api/recipes?preference=${encodeURIComponent(prefs.preference)}`);

    const recipes = await response.json();
    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new Error("Recipe API returned no recipes");
    }

    if (renderId !== activeRenderId) {
      return;
    }

    mergeRecipes(recipes);
    lastRecipePreference = prefs.preference;
    const providers = [...new Set(recipes.map((recipe) => recipe.provider || recipe.source).filter(Boolean))];
    setRecipeStatus(`Using live recipe data from ${providers.length ? providers.join(" and ") : "recipe APIs"}.`);
  } catch (error) {
    console.error(error);
    recipeBank = [...starterRecipeBank];
    lastRecipePreference = "";
    setRecipeStatus("Using curated recipe data. Live recipe APIs could not be loaded.");
  }
}

function matchesPreference(recipe, preference) {
  if (preference === "balanced") return recipe.tags.includes("balanced");
  if (preference === "high-protein") return recipe.tags.includes("high-protein") || recipe.protein >= 30;
  if (preference === "high-protein-low-carb") {
    return recipe.tags.includes("high-protein-low-carb") ||
      (recipe.tags.includes("high-protein") && recipe.tags.includes("low-carb"));
  }
  if (preference === "low-calorie") return recipe.tags.includes("low-calorie") || recipe.cost <= 3.25;
  if (preference === "low-carb") return recipe.tags.includes("low-carb") || recipe.tags.includes("high-protein-low-carb");
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
  if (prefs.preference === "low-calorie" && recipe.cost <= 3.25) score += 10;
  if (prefs.preference === "low-carb" && recipe.tags.includes("low-carb")) score += 14;
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

function isYoutubeRecipe(recipe) {
  return recipe.provider === YOUTUBE_PROVIDER;
}

function youtubeMealSlots(totalMeals) {
  const exactTarget = totalMeals * YOUTUBE_RECIPE_SHARE;
  const minimumTarget = Math.floor(exactTarget);
  const target = minimumTarget + (Math.random() < exactTarget - minimumTarget ? 1 : 0);

  return new Set(
    meals
      .map((_, index) => index)
      .sort(() => Math.random() - 0.5)
      .slice(0, target)
  );
}

function preferProvider(recipes, useYoutube, allowFallback = true) {
  const providerMatches = recipes.filter((recipe) => isYoutubeRecipe(recipe) === useYoutube);
  if (!allowFallback) return providerMatches;
  if (providerMatches.length >= MIN_PROVIDER_ROTATION_CANDIDATES) return providerMatches;

  const providerIds = new Set(providerMatches.map((recipe) => recipe.id));
  const fallbacks = recipes.filter((recipe) => !providerIds.has(recipe.id));
  return [...providerMatches, ...fallbacks];
}

function avoidRecentRecipes(recipes) {
  const notRecentlyUsed = recipes.filter((recipe) => !recentRecipeIds.includes(recipe.id));
  if (notRecentlyUsed.length > 0) return notRecentlyUsed;

  const notInPreviousPlan = recipes.filter((recipe) => !previousPlanRecipeIds.has(recipe.id));
  return notInPreviousPlan.length > 0 ? notInPreviousPlan : recipes;
}

function buildPlan(prefs) {
  const selected = [];
  const usedTitles = new Set();
  const youtubeSlots = youtubeMealSlots(meals.length);

  meals.forEach((meal, mealIndex) => {
    const quickRecipes = recipeBank.filter((recipe) => recipe.meal === meal && isQuickPrep(recipe));
    const mealRecipes = quickRecipes.length > 0
      ? quickRecipes
      : starterRecipeBank.filter((recipe) => recipe.meal === meal && isQuickPrep(recipe));
    const uniqueRecipes = mealRecipes
      .filter((recipe) => !usedTitles.has(recipe.title.toLowerCase()));
    const baseRecipes = uniqueRecipes.length > 0 ? uniqueRecipes : mealRecipes;
    const providerRecipes = preferProvider(baseRecipes, youtubeSlots.has(mealIndex));
    const preferredProviderRecipes = providerRecipes
      .filter((recipe) => matchesPreference(recipe, prefs.preference));
    const matchedRecipes = preferredProviderRecipes.length > 0
      ? preferredProviderRecipes
      : providerRecipes;
    const candidateRecipes = avoidRecentRecipes(matchedRecipes);
    const candidates = candidateRecipes
      .map((recipe) => ({
        recipe,
        score: scoreRecipe(recipe, prefs, mealIndex)
      }))
      .sort((a, b) => b.score - a.score);

    const selectedMeal = { ...chooseFromTop(candidates, SELECTION_POOL_SIZE).recipe, servings: prefs.people * prepDays };
    usedTitles.add(selectedMeal.title.toLowerCase());
    selected.push(selectedMeal);
  });

  const estimated = selected.reduce((sum, item) => sum + item.cost * prefs.people * prepDays, 0);

  if (estimated > prefs.budget) {
    return selected
      .map((item) => {
        if (item.cost <= 4.2) return item;
        const otherMeals = selected.filter((selectedItem) => selectedItem.id !== item.id);
        const usedIds = new Set(otherMeals.map((selectedItem) => selectedItem.id));
        const usedTitles = new Set(otherMeals.map((selectedItem) => selectedItem.title.toLowerCase()));
        const cheaperRecipes = recipeBank
          .filter((recipe) => recipe.meal === item.meal && recipe.cost < item.cost && isQuickPrep(recipe))
          .filter((recipe) => matchesPreference(recipe, prefs.preference))
          .filter((recipe) => !usedIds.has(recipe.id) && !usedTitles.has(recipe.title.toLowerCase()));
        const providerRecipes = preferProvider(cheaperRecipes, isYoutubeRecipe(item), false);
        const cheaperCandidates = avoidRecentRecipes(providerRecipes)
          .sort((a, b) => a.cost - b.cost);
        const cheaper = chooseFromTop(cheaperCandidates, 3);
        return cheaper ? { ...item, ...cheaper, servings: prefs.people * prepDays } : item;
      });
  }

  return selected;
}

function rememberRecentRecipes(plan) {
  const ids = plan.map((item) => item.id).filter(Boolean);
  previousPlanRecipeIds = new Set(ids);
  recentRecipeIds = [...ids, ...recentRecipeIds.filter((id) => !ids.includes(id))]
    .slice(0, RECENT_RECIPE_MEMORY);
}

function isKitchenStapleIngredient(name) {
  return /\b(water|tap water|filtered water|ice water|boiling water|warm water|cold water)\b/i.test(String(name || ""));
}

function buildGroceries(plan, prefs) {
  const groceries = new Map();

  plan.forEach((recipe) => {
    recipe.ingredients.forEach(([name, amount, unit, category]) => {
      if (isKitchenStapleIngredient(name)) return;
      const key = `${category}:${name}:${unit}`;
      const existing = groceries.get(key) || { name, amount: 0, unit, category };
      existing.amount += amount * prefs.people * prepDays;
      groceries.set(key, existing);
    });
  });

  return groceries;
}

const STORE_PACKAGE_RULES = [
  {
    match: /\b(greek yogurt|yogurt)\b/i,
    unitType: "volume",
    packages: [
      { amount: 32, unit: "oz", label: "32 oz tub" },
      { amount: 16, unit: "oz", label: "16 oz tub" },
      { amount: 5, unit: "oz", label: "5 oz tub" }
    ]
  },
  {
    match: /\bcottage cheese\b/i,
    unitType: "volume",
    packages: [
      { amount: 24, unit: "oz", label: "24 oz tub" },
      { amount: 16, unit: "oz", label: "16 oz tub" }
    ]
  },
  {
    match: /\bsalsa\b/i,
    unitType: "volume",
    packages: [
      { amount: 24, unit: "oz", label: "24 oz jar" },
      { amount: 16, unit: "oz", label: "16 oz jar" }
    ]
  },
  {
    match: /\bpeanut butter\b/i,
    unitType: "volume",
    packages: [
      { amount: 40, unit: "oz", label: "40 oz jar" },
      { amount: 16, unit: "oz", label: "16 oz jar" }
    ]
  },
  {
    match: /\b(shredded cheese|cheddar|mozzarella|parmesan cheese)\b/i,
    unitType: "volume",
    ouncesPerCup: 4,
    packages: [
      { amount: 16, unit: "oz", label: "16 oz bag" },
      { amount: 8, unit: "oz", label: "8 oz bag" }
    ]
  },
  {
    match: /\b(baby spinach|spinach)\b/i,
    unitType: "volume",
    ouncesPerCup: 1,
    packages: [
      { amount: 16, unit: "oz", label: "16 oz bag" },
      { amount: 5, unit: "oz", label: "5 oz clamshell" }
    ]
  },
  {
    match: /\b(cauliflower rice|broccoli|green beans|berries|frozen corn|frozen peas|peas|corn)\b/i,
    unitType: "volume",
    ouncesPerCup: 4,
    packages: [
      { amount: 16, unit: "oz", label: "16 oz bag" },
      { amount: 12, unit: "oz", label: "12 oz bag" }
    ]
  },
  {
    match: /\b(shredded cabbage|cabbage|romaine)\b/i,
    unitType: "produceEach",
    cupsPerEach: 6,
    packages: [
      { amount: 1, unit: "head", label: "head", pluralLabel: "heads" }
    ]
  },
  {
    match: /\b(cucumber|zucchini|carrot|celery|lemon|bell peppers?|yellow onion|red onion|onion)\b/i,
    unitType: "produceEach",
    cupsPerEach: 1,
    packages: [
      { amount: 1, unit: "each", label: "each" }
    ]
  },
  {
    match: /\b(tomatoes|tomato)\b/i,
    unitType: "produceEach",
    cupsPerEach: 1,
    packages: [
      { amount: 1, unit: "each", label: "medium tomato", pluralLabel: "medium tomatoes" }
    ]
  },
  {
    match: /\b(potatoes|potato)\b/i,
    unitType: "weight",
    packages: [
      { amount: 5, unit: "lb", label: "5 lb bag" },
      { amount: 1, unit: "lb", label: "lb package" }
    ]
  },
  {
    match: /\b(chicken breast|ground turkey|ground beef|chicken sausage|salmon fillet|salmon)\b/i,
    unitType: "weight",
    packages: [
      { amount: 3, unit: "lb", label: "3 lb package" },
      { amount: 1, unit: "lb", label: "lb package" }
    ]
  },
  {
    match: /\b(milk|oat milk)\b/i,
    unitType: "volume",
    packages: [
      { amount: 64, unit: "fl oz", label: "1/2 gallon" },
      { amount: 32, unit: "fl oz", label: "1 quart" },
      { amount: 16, unit: "fl oz", label: "1 pint" }
    ]
  },
  {
    match: /\b(tortillas?|wraps?)\b/i,
    unitType: "each",
    packages: [
      { amount: 10, unit: "count", label: "10-count package" },
      { amount: 8, unit: "count", label: "8-count package" }
    ]
  },
  {
    match: /\bpita bread\b/i,
    unitType: "each",
    packages: [
      { amount: 6, unit: "count", label: "6-count package" }
    ]
  },
  {
    match: /\beggs?\b/i,
    unitType: "each",
    packages: [
      { amount: 18, unit: "count", label: "18-count carton" },
      { amount: 12, unit: "count", label: "dozen" }
    ]
  },
  {
    match: /\b(chili seasoning|everything seasoning|seasoning)\b/i,
    unitType: "spice",
    packages: [
      { amount: 1, unit: "package", label: "packet or small jar", pluralLabel: "packets or small jars" }
    ]
  },
  {
    match: /\b(chia seeds|rice|quinoa|red lentils)\b/i,
    unitType: "packageOnly",
    packages: [
      { amount: 1, unit: "package", label: "bag", pluralLabel: "bags" }
    ]
  },
  {
    match: /\b(pasta|rice noodles|noodles)\b/i,
    unitType: "packageOnly",
    packages: [
      { amount: 1, unit: "package", label: "box or bag", pluralLabel: "boxes or bags" }
    ]
  },
  {
    match: /\b(rolled oats|oats)\b/i,
    unitType: "packageOnly",
    packages: [
      { amount: 1, unit: "package", label: "canister", pluralLabel: "canisters" }
    ]
  },
  {
    match: /\b(plant protein powder)\b/i,
    unitType: "spice",
    packages: [
      { amount: 1, unit: "package", label: "tub", pluralLabel: "tubs" }
    ]
  },
  {
    match: /\b(black beans|chickpeas|diced tomatoes|coconut milk)\b/i,
    unitType: "each",
    packages: [
      { amount: 1, unit: "can", label: "can" }
    ]
  },
  {
    match: /\b(extra firm tofu|tofu)\b/i,
    unitType: "each",
    packages: [
      { amount: 1, unit: "block", label: "block" }
    ]
  },
  {
    match: /\b(bread)\b/i,
    unitType: "each",
    packages: [
      { amount: 20, unit: "slice", label: "loaf", pluralLabel: "loaves" }
    ]
  },
  {
    match: /\b(apples|apple)\b/i,
    unitType: "each",
    packages: [
      { amount: 1, unit: "each", label: "apple", pluralLabel: "apples" }
    ]
  }
];

const STORE_UNIT_LABELS = new Set([
  "bag",
  "bags",
  "box",
  "boxes",
  "carton",
  "cartons",
  "jar",
  "jars",
  "package",
  "packages",
  "packet",
  "packets",
  "tub",
  "tubs"
]);

function normalizeUnit(unit) {
  return String(unit || "").trim().toLowerCase();
}

function amountInStoreUnit(amount, unit, rule) {
  const normalized = normalizeUnit(unit);
  if (rule.unitType === "weight") {
    if (["lb", "lbs", "pound", "pounds"].includes(normalized)) return amount;
    if (["oz", "ounce", "ounces"].includes(normalized)) return amount / 16;
    return null;
  }
  if (rule.unitType === "produceEach") {
    if (["each", "count", "ct"].includes(normalized)) return amount;
    const cupFactors = {
      tsp: 1 / 48,
      teaspoon: 1 / 48,
      teaspoons: 1 / 48,
      tbsp: 1 / 16,
      tablespoon: 1 / 16,
      tablespoons: 1 / 16,
      cup: 1,
      cups: 1
    };
    const factor = cupFactors[normalized];
    return factor ? (amount * factor) / rule.cupsPerEach : null;
  }
  if (rule.unitType === "each") {
    if ([
      "each",
      "count",
      "ct",
      "wrap",
      "wraps",
      "tortilla",
      "tortillas",
      "can",
      "cans",
      "block",
      "blocks",
      "slice",
      "slices",
      "loaf",
      "loaves"
    ].includes(normalized)) return amount;
    return null;
  }
  if (rule.unitType === "spice") {
    return amount > 0 ? 1 : 0;
  }
  if (rule.unitType === "packageOnly") {
    return amount > 0 ? Math.ceil(amount / 8) : 0;
  }
  if (rule.unitType !== "volume") return null;

  if (rule.ouncesPerCup) {
    const cupFactors = {
      tsp: 1 / 48,
      teaspoon: 1 / 48,
      teaspoons: 1 / 48,
      tbsp: 1 / 16,
      tablespoon: 1 / 16,
      tablespoons: 1 / 16,
      cup: 1,
      cups: 1,
      oz: 1 / rule.ouncesPerCup,
      ounce: 1 / rule.ouncesPerCup,
      ounces: 1 / rule.ouncesPerCup
    };
    const factor = cupFactors[normalized];
    return factor ? amount * factor * rule.ouncesPerCup : null;
  }

  const volumeToOunces = {
    tsp: 1 / 6,
    teaspoon: 1 / 6,
    teaspoons: 1 / 6,
    tbsp: 0.5,
    tablespoon: 0.5,
    tablespoons: 0.5,
    cup: 8,
    cups: 8,
    "fl oz": 1,
    floz: 1,
    oz: 1,
    ounce: 1,
    ounces: 1
  };
  const factor = volumeToOunces[normalized];
  return factor ? amount * factor : null;
}

function choosePackageSize(amount, packages) {
  const sorted = [...packages].sort((a, b) => b.amount - a.amount);
  return sorted.find((candidate) => amount >= candidate.amount) || sorted[sorted.length - 1];
}

function packageQuantity(amount, packageSize) {
  const count = Math.max(1, Math.ceil(amount / packageSize.amount));
  if (packageSize.pluralLabel && count !== 1) return `${count} ${packageSize.pluralLabel}`;
  if (packageSize.label === "dozen") return `${count} dozen`;
  if (packageSize.label === "each") return `${count} each`;
  const separator = /^\d/.test(packageSize.label) ? "- " : "";
  return `${count}${separator || " "}${packageSize.label}${count === 1 || packageSize.label.endsWith("s") ? "" : "s"}`;
}

function storeQuantityFor(item) {
  const rule = STORE_PACKAGE_RULES.find((candidate) => candidate.match.test(item.name));
  if (!rule) {
    const unit = normalizeUnit(item.unit);
    if (["wrap", "wraps", "tortilla", "tortillas"].includes(unit)) {
      return packageQuantity(item.amount, { amount: 10, unit: "count", label: "10-count package" });
    }
    if (["slice", "slices"].includes(unit) && /\bbread\b/i.test(item.name)) {
      return packageQuantity(item.amount, { amount: 20, unit: "slice", label: "loaf", pluralLabel: "loaves" });
    }
    if (STORE_UNIT_LABELS.has(unit)) {
      const count = Math.max(1, Math.ceil(item.amount));
      const singular = unit.endsWith("s") ? unit.slice(0, -1) : unit;
      return `${count} ${count === 1 ? singular : `${singular}s`}`;
    }
    if (["lb", "lbs", "pound", "pounds"].includes(unit)) {
      const count = Math.max(1, Math.ceil(item.amount));
      return `${count} lb package${count === 1 ? "" : "s"}`;
    }
    if (["oz", "ounce", "ounces"].includes(unit)) {
      return `${Math.max(1, Math.ceil(item.amount))} oz package`;
    }
    if (["can", "cans"].includes(unit)) {
      const count = Math.max(1, Math.ceil(item.amount));
      return `${count} can${count === 1 ? "" : "s"}`;
    }
    if (["block", "blocks"].includes(unit)) {
      const count = Math.max(1, Math.ceil(item.amount));
      return `${count} block${count === 1 ? "" : "s"}`;
    }
    if (["each", "count", "ct"].includes(unit)) {
      return `${Math.max(1, Math.ceil(item.amount))} each`;
    }
    if (["tsp", "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons"].includes(unit)) {
      return item.category === "pantry" ? "1 small jar or package" : "1 package";
    }
    if (["cup", "cups"].includes(unit)) {
      if (item.category === "produce") return "1 bag or package";
      if (item.category === "dairy" || item.category === "refrigerated") return "1 tub or package";
      if (item.category === "frozen") return "1 bag";
      if (item.category === "pantry") return "1 bag or box";
      return "1 package";
    }
    if (["scoop", "scoops"].includes(unit)) return "1 tub";
    return `${formatAmount(item.amount)} ${item.unit}`;
  }

  const amount = amountInStoreUnit(item.amount, item.unit, rule);
  if (!amount) return `${formatAmount(item.amount)} ${item.unit}`;

  const packageSize = choosePackageSize(amount, rule.packages);
  return packageQuantity(amount, packageSize);
}

function mergeRecipes(recipes) {
  const existingIds = new Set(recipeBank.map((recipe) => recipe.id));
  const existingImages = new Set(recipeBank.map(recipeImageKey).filter(Boolean));
  const additions = recipes.filter((recipe) => {
    const imageKey = recipeImageKey(recipe);
    if (existingIds.has(recipe.id) || !isTrustedRecipePhoto(recipe) || !imageKey || existingImages.has(imageKey)) {
      return false;
    }
    existingIds.add(recipe.id);
    existingImages.add(imageKey);
    return true;
  });
  recipeBank = [...recipeBank, ...additions];
}

function recipeImageKey(recipe = {}) {
  try {
    const url = new URL(String(recipe.image || ""), location.origin);
    url.search = "";
    url.hash = "";
    return url.href.toLowerCase();
  } catch {
    return "";
  }
}

function prioritizeProviderForSwap(recipes, useYoutube) {
  const preferredProvider = recipes.filter((recipe) => isYoutubeRecipe(recipe) === useYoutube);
  const otherProviders = recipes.filter((recipe) => isYoutubeRecipe(recipe) !== useYoutube);
  return [...preferredProvider, ...otherProviders];
}

function replacementCandidates(meal, currentId, prefs, useYoutube) {
  const currentIds = new Set(currentPlan.map((recipe) => recipe.id));
  const currentTitles = new Set(currentPlan.map((recipe) => recipe.title.toLowerCase()));
  const currentImages = new Set(
    currentPlan.filter((recipe) => recipe.id !== currentId).map(recipeImageKey).filter(Boolean)
  );
  const quickRecipes = recipeBank
    .filter((recipe) =>
      recipe.meal === meal &&
      recipe.id !== currentId &&
      !currentIds.has(recipe.id) &&
      !currentTitles.has(recipe.title.toLowerCase()) &&
      !currentImages.has(recipeImageKey(recipe)) &&
      isQuickPrep(recipe)
    );
  const providerRecipes = prioritizeProviderForSwap(quickRecipes, useYoutube);
  const preferredRecipes = providerRecipes
    .filter((recipe) => matchesPreference(recipe, prefs.preference));
  const candidates = preferredRecipes.length > 0 ? preferredRecipes : providerRecipes;
  const mealIndex = meals.indexOf(meal);

  return avoidRecentRecipes(candidates)
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(recipe, prefs, mealIndex)
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ recipe }) => ({ ...recipe, servings: prefs.people * prepDays }));
}

function refreshDependentViews(prefs) {
  currentGroceries = buildGroceries(currentPlan, prefs);
  saveCurrentState(prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  runAiFeatures(prefs);
}

async function fetchMoreRecipes(prefs) {
  if (location.protocol === "file:") return;

  const response = await apiFetch(`/api/recipes?preference=${encodeURIComponent(prefs.preference)}`);

  const recipes = await response.json();
  if (Array.isArray(recipes)) {
    mergeRecipes(recipes);
  }
}

async function swapMeal(item, button) {
  const prefs = getPreferences();
  if (!cloudState.authenticated &&
      !requireFeature("swaps", "You have used all free meal swaps for this week.")) return;
  button.disabled = true;
  button.textContent = "Finding another...";

  try {
    const useYoutube = isYoutubeRecipe(item);
    let candidates = replacementCandidates(item.meal, item.id, prefs, useYoutube);

    if (candidates.length === 0) {
      await fetchMoreRecipes(prefs);
      candidates = replacementCandidates(item.meal, item.id, prefs, useYoutube);
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
      if (!await consumeFeature("swaps", "You have used all free meal swaps for this week.")) {
        button.disabled = false;
        button.textContent = `Pick a different ${item.meal.toLowerCase()}`;
        return;
      }
      currentPlan[currentIndex] = chooseFromTop(candidates, 6);
      updateSubscriptionUi();
      rememberRecentRecipes(currentPlan);
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
    const response = await apiFetch("/api/ai/prep-tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        preferences: prefs,
        meals: currentPlan
      })
    });

    const tips = await response.json();
    if (tipsId === activeTipsId) {
      renderPrepTips(tips);
    }
  } catch (error) {
    console.error(error);
    if (tipsId === activeTipsId) {
      renderPrepTips({
        prepOrder: ["Prep guidance is unavailable. Your meal plan is still saved."],
        timeSavers: [],
        substitutions: []
      });
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
    const response = await apiFetch("/api/ai/meal-instructions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        preferences: prefs,
        meals: currentPlan
      })
    });

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
    saveCurrentState(prefs);
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
    image.src = recipeImage(item);
    image.alt = item.title;
    image.onerror = () => {
      image.onerror = null;
      image.src = fallbackImage(item.title, item);
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
      .map(([name, amount, unit, category]) => {
        const total = amount * prefs.people * prepDays;
        return `<li>${escapeHtml(name)} ${escapeHtml(storeQuantityFor({ name, amount: total, unit, category }))}</li>`;
      })
      .join("");
    renderMealInstructions(node, item);
    node.querySelector(".chip-row").innerHTML = [
      `${item.servings} servings`,
      `${item.minutes} min prep`,
      `${item.protein}g protein`,
      item.source
    ]
      .map((chip) => `<span class="chip">${escapeHtml(String(chip))}</span>`)
      .join("");
    const sourceLink = node.querySelector(".source-link");
    if (item.sourceUrl) {
      sourceLink.href = item.sourceUrl;
      sourceLink.textContent = "Watch the source video";
      sourceLink.hidden = false;
    }
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
            <li tabindex="0" role="checkbox" aria-checked="false">
              <span class="grocery-check" aria-hidden="true"></span>
              <span><span class="grocery-item-name">${item.name}</span>${nutritionText}</span>
              <strong>${storeQuantityFor(item)}</strong>
            </li>
          `;
        })
        .join("");
      return `<article class="grocery-group"><h3>${titleCase(category)}</h3><ul class="grocery-items">${lis}</ul></article>`;
    })
    .join("");

  groceryList.querySelectorAll(".grocery-items li").forEach((item) => {
    const toggle = () => {
      const checked = item.getAttribute("aria-checked") === "true";
      item.setAttribute("aria-checked", String(!checked));
    };
    item.addEventListener("click", toggle);
    item.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    });
  });
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
    const response = await apiFetch("/api/ingredients/normalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ingredients })
    });

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

  const response = await apiFetch(`/api/stores?zip=${encodeURIComponent(zip)}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error || "Nearby stores could not be loaded");
  }

  return body;
}

async function renderStores(plan, prefs) {
  const storesId = ++activeStoresId;
  const baseCost = plan.reduce((sum, meal) => sum + meal.cost * prefs.people * prepDays, 0);

  storeContext.textContent = `ZIP ${prefs.zip} - loading nearby grocery store addresses.`;
  storeList.innerHTML = `<p class="empty-state">Finding nearby grocery stores...</p>`;

  try {
    const nearby = await loadNearbyStores(prefs.zip);
    if (storesId !== activeStoresId) return;

    const stores = (nearby?.stores || []).filter((store) => store.address);
    if (!stores.length) {
      storeContext.textContent = `ZIP ${prefs.zip} - no nearby grocery stores with verified addresses were returned.`;
      storeList.innerHTML = `<p class="empty-state">No nearby store addresses are available right now. Try another ZIP code or check back after the live store lookup is configured.</p>`;
      return;
    }

    const ranked = stores
      .map((store) => ({
        ...store,
        total: baseCost * store.multiplier
      }))
      .sort((a, b) => a.total - b.total);

    storeContext.textContent = `${nearby.location?.label || `ZIP ${prefs.zip}`} - Map providers find nearby store addresses only. Basket totals are app estimates, not live store prices.`;
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
              <p class="store-address">${escapeHtml(store.address)}</p>
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
  } catch (error) {
    console.error(error);
    if (storesId !== activeStoresId) return;
    storeContext.textContent = `ZIP ${prefs.zip} - nearby store addresses could not be loaded.`;
    storeList.innerHTML = `<p class="empty-state">${escapeHtml(error.message || "Nearby store addresses could not be loaded.")}</p>`;
  }
}

function formatAmount(amount) {
  const rounded = Math.round(amount * 4) / 4;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2)).replace(/0$/, "");
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setCreatePlanLoading(isLoading) {
  isCreatingPlan = isLoading;
  if (createPlanButton) {
    createPlanButton.disabled = isLoading;
    createPlanButton.classList.toggle("is-loading", isLoading);
    createPlanButton.setAttribute("aria-busy", String(isLoading));
  }
  if (createPlanButtonLabel) {
    createPlanButtonLabel.textContent = isLoading ? "Building your meal plan" : "Create my meal plan";
  }
  if (createPlanButtonArrow) {
    createPlanButtonArrow.hidden = isLoading;
  }
  if (planLoadingStatus) {
    planLoadingStatus.hidden = !isLoading;
    planLoadingStatus.textContent = isLoading
      ? "Working on your meals now. This can take a moment."
      : "";
  }
}

async function rerender(options = {}) {
  const renderId = ++activeRenderId;
  const prefs = getPreferences();
  const startedAt = performance.now();

  if (options.loadRecipes) {
    if (!await consumeFeature("plans", "You have used your free meal plan for this week.")) {
      return false;
    }
    hasBuiltPlan = false;
    clearPlanViews("Loading quick recipes...");
    await loadRealRecipes(prefs, renderId);
  }

  if (renderId !== activeRenderId) {
    return;
  }

  currentPlan = buildPlan(prefs);
  if (options.loadRecipes) updateSubscriptionUi();
  rememberRecentRecipes(currentPlan);
  currentGroceries = buildGroceries(currentPlan, prefs);
  saveCurrentState(prefs);
  if (options.loadRecipes) savePlanHistory(prefs);

  renderPlan(currentPlan, prefs);
  renderGroceries(currentGroceries);
  renderStores(currentPlan, prefs);
  enrichGroceries();
  runAiFeatures(prefs);
  hasBuiltPlan = true;
  track("meal_plan_generated", {
    authenticated: cloudState.authenticated,
    duration_ms: Math.round(performance.now() - startedAt),
    household_size: prefs.people,
    preference: prefs.preference,
    source_count: new Set(currentPlan.map((meal) => meal.provider || meal.source || "starter")).size,
  });
  return true;
}

function showPage(pageId, options = {}) {
  if (!document.getElementById(pageId)) return false;
  if (!hasBuiltPlan && pageId !== "setup") {
    clearPlanViews("Build a meal prep plan to see quick recipe results.");
  }

  const previousPageId = activePageId;
  activePageId = pageId;
  if (options.pushHistory !== false && previousPageId !== pageId) {
    window.history.pushState({ prepwisePage: pageId }, "", `#${pageId}`);
  }
  document.querySelectorAll(".step").forEach((step) => {
    step.classList.toggle("is-active", step.dataset.page === pageId);
    if (step.dataset.page === pageId) step.setAttribute("aria-current", "page");
    else step.removeAttribute("aria-current");
  });
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("is-active", page.id === pageId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  track("app_page_viewed", {
    page: pageId,
    ...window.PrepWiseTelemetry?.mobileContext?.(),
  });
  return true;
}

window.PrepWiseNavigation = {
  back() {
    if (activePageId === "setup") return false;
    window.history.back();
    return true;
  },
  current: () => activePageId,
  show: (pageId) => showPage(pageId),
};

window.addEventListener("popstate", (event) => {
  const pageId = event.state?.prepwisePage || window.location.hash.slice(1) || "setup";
  showPage(pageId, { pushHistory: false });
});

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

const budgetOutput = document.querySelector("#budget-output");
const budgetInput = document.querySelector("#budget");
const peopleInput = document.querySelector("#people");
const syncBudgetOutput = () => {
  budgetOutput.textContent = `$${budgetInput.value}`;
  const progress = ((Number(budgetInput.value) - Number(budgetInput.min)) / (Number(budgetInput.max) - Number(budgetInput.min))) * 100;
  budgetInput.style.setProperty("--range-progress", `${progress}%`);
};
budgetInput.addEventListener("input", syncBudgetOutput);
syncBudgetOutput();

document.querySelectorAll("[data-step-people]").forEach((button) => {
  button.addEventListener("click", () => {
    const next = Math.max(Number(peopleInput.min), Math.min(Number(peopleInput.max), Number(peopleInput.value) + Number(button.dataset.stepPeople)));
    peopleInput.value = String(next);
    peopleInput.dispatchEvent(new Event("change", { bubbles: true }));
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isCreatingPlan) return;
  if (!form.reportValidity()) return;
  const prefs = getPreferences();
  track("meal_plan_requested", {
    authenticated: cloudState.authenticated,
    household_size: prefs.people,
    preference: prefs.preference,
  });
  setCreatePlanLoading(true);
  try {
    const built = await rerender({ loadRecipes: true });
    if (built) showPage("meals");
  } finally {
    setCreatePlanLoading(false);
  }
});

copyButton.addEventListener("click", async () => {
  const text = Array.from(currentGroceries.values())
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
    .map((item) => `${storeQuantityFor(item)} ${item.name}`)
    .join("\n");

  await navigator.clipboard.writeText(text);
  copyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyButton.textContent = "Copy list";
  }, 1400);
});

subscriptionButton.addEventListener("click", () => {
  const status = cloudState.authenticated && cloudState.data && !isDevBillingBypassEnabled()
    ? { isPro: cloudState.data.isPro }
    : subscriptionManager.status();
  if (status.isPro) {
    openPaywall("Your PrepWise Pro subscription is active.");
    return;
  }
  usageBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  usageBanner.focus?.({ preventScroll: true });
});

document.querySelectorAll("[data-subscription-product]").forEach((button) => {
  button.addEventListener("click", () => purchaseProduct(button.dataset.subscriptionProduct));
});

restorePurchasesButton.addEventListener("click", restorePurchases);
manageSubscriptionButton.addEventListener("click", manageSubscriptions);

manageDemoSubscriptionButton.addEventListener("click", () => {
  subscriptionManager.clearDemo();
  purchaseStatus.textContent = "Returned to the Free plan.";
  updateSubscriptionUi();
});

accountUpgradeButton.addEventListener("click", () => openPaywall("Review PrepWise Pro plans and subscription status."));
accountRestoreButton.addEventListener("click", restorePurchases);
accountManageSubscriptionButton.addEventListener("click", manageSubscriptions);

signOutButton.addEventListener("click", async () => {
  if (cloudState.authenticated) {
    await window.PrepWiseCloud?.signOut?.();
  }
  currentPlan = [];
  currentGroceries = new Map();
  hasBuiltPlan = false;
  clearPlanViews("Signed out. Cloud data remains available for your next sign-in.");
  accountActionStatus.textContent = "Signed out.";
  showPage("account");
});

deleteAccountButton.addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Permanently delete your PrepWise account, cloud plans, preferences, usage, and linked web billing customer?"
  );
  if (!confirmed) return;
  track("account_deletion_confirmed", { authenticated: cloudState.authenticated });

  if (cloudState.authenticated) {
    try {
      accountActionStatus.textContent = "Deleting your account...";
      await apiFetch("/api/account/delete", { method: "DELETE" });
      track("account_deleted", { source: "cloud" });
      try {
        await window.PrepWiseCloud?.signOut?.();
      } catch {
        // The server already invalidated and deleted the authentication session.
      }
    } catch (error) {
      console.error(error);
      reportError(error, { action: "account_deletion" });
      track("account_deletion_failed", { source: "cloud" });
      accountActionStatus.textContent = "Your account could not be deleted. Please contact support.";
      return;
    }
  }

  Object.keys(localStorage)
    .filter((key) => key.startsWith("prepwise-"))
    .forEach((key) => localStorage.removeItem(key));
  currentPlan = [];
  currentGroceries = new Map();
  favoriteMeals = [];
  hasBuiltPlan = false;
  clearPlanViews("");
  applyPreferences({ budget: 125, zip: "60614", people: 2, preference: "balanced" });
  updateSubscriptionUi();
  accountActionStatus.textContent = "Your PrepWise account and local data were permanently deleted.";
  if (!cloudState.authenticated) track("account_deleted", { source: "guest" });
  window.PrepWiseTelemetry?.reset?.();
});

const restoredPreferences = restorePreferences() || getPreferences();
updateSubscriptionUi();
loadStoreProducts();
if (!restoreSavedPlan(restoredPreferences)) {
  setRecipeStatus("Build a meal prep plan to load quick recipes, including YouTube videos.");
  clearPlanViews("");
}

accountSignInButton.addEventListener("click", () => {
  track("sign_in_opened");
  window.PrepWiseCloud?.openAuth?.("signIn");
});
accountCreateButton.addEventListener("click", () => {
  track("sign_up_opened");
  window.PrepWiseCloud?.openAuth?.("signUp");
});

window.PrepWiseCloud?.subscribe?.((nextState) => {
  cloudState = nextState;
  updateSubscriptionUi();
  if (!nextState.authenticated) {
    restoredCloudAccount = false;
    lastTrackedSubscriptionState = "";
    return;
  }
  if (!nextState.data) return;
  window.PrepWiseTelemetry?.identify?.(nextState.data.user.id, {
    account_type: nextState.data.isPro ? "pro" : "free",
  });
  const subscription = nextState.data.subscription;
  const subscriptionState = subscription
    ? `${subscription.status}:${subscription.cancelAtPeriodEnd}:${subscription.currentPeriodEnd || ""}`
    : "free";
  if (subscriptionState !== lastTrackedSubscriptionState) {
    lastTrackedSubscriptionState = subscriptionState;
    track("subscription_state_observed", {
      status: subscription?.status || "free",
      scheduled_to_cancel: Boolean(subscription?.cancelAtPeriodEnd),
    });
    if (subscription?.cancelAtPeriodEnd) {
      track("stripe_cancellation_detected", { status: subscription.status });
    }
  }
  if (restoredCloudAccount) return;
  restoredCloudAccount = true;
  track("authenticated_session_started", {
    account_type: nextState.data.isPro ? "pro" : "free",
    has_saved_plan: Boolean(nextState.data.plans?.length),
    referral_code: referralCode(),
  });
  const referral = referralPayload();
  if (referral?.code && nextState.data.profile?.referralCode !== referral.code) {
    window.PrepWiseCloud.claimReferral(referral)
      ?.catch((error) => console.error("Could not claim referral", error));
  }

  const cloudPreferences = nextState.data.preferences;
  const latestPlan = nextState.data.plans?.[0];
  if (cloudPreferences) {
    applyPreferences(cloudPreferences);
  } else {
    window.PrepWiseCloud.savePreferences(getPreferences())
      ?.catch((error) => console.error("Could not migrate preferences", error));
  }
  if (latestPlan?.plan?.length === meals.length) {
    currentPlan = refreshPlanAssets(latestPlan.plan);
    const prefs = getPreferences();
    currentGroceries = buildGroceries(currentPlan, prefs);
    hasBuiltPlan = true;
    renderPlan(currentPlan, prefs);
    renderGroceries(currentGroceries);
    renderStores(currentPlan, prefs);
    setRecipeStatus("Restored your latest cloud meal plan.");
  } else {
    const localPlan = loadStoredValue(STORAGE_KEYS.plan, null);
    if (localPlan?.plan?.length === meals.length) {
      window.PrepWiseCloud.savePlan(localPlan.plan, getPreferences())
        ?.catch((error) => console.error("Could not migrate local plan", error));
    }
  }
});

window.addEventListener("prepwise:entitlement", async (event) => {
  if (!cloudState.authenticated) return;
  try {
    applyStoreResult(await verifyNativeStoreResult(event.detail));
  } catch (error) {
    reportError(error, { action: "native_entitlement_refresh" });
  }
});

const launchPage = window.location.hash.slice(1);
if (launchPage && document.getElementById(launchPage)) {
  showPage(launchPage, { pushHistory: false });
} else {
  window.history.replaceState({ prepwisePage: "setup" }, "", "#setup");
}

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

function loadProviderPreference() {
  const source = fs.readFileSync("client.js", "utf8");
  const minMatch = source.match(/const MIN_PROVIDER_ROTATION_CANDIDATES = (\d+);/);
  const youtubeMatch = source.match(/const YOUTUBE_PROVIDER = "([^"]+)";/);
  const isYoutubeStart = source.indexOf("function isYoutubeRecipe");
  const preferStart = source.indexOf("function preferProvider");
  const preferEnd = source.indexOf("\nfunction avoidRecentRecipes", preferStart);

  if (!minMatch || !youtubeMatch || isYoutubeStart === -1 || preferStart === -1 || preferEnd === -1) {
    throw new Error("Could not load provider preference helpers");
  }

  const helpers = [
    `const YOUTUBE_PROVIDER = "${youtubeMatch[1]}";`,
    `const MIN_PROVIDER_ROTATION_CANDIDATES = ${minMatch[1]};`,
    source.slice(isYoutubeStart, preferEnd)
  ].join("\n");

  return new Function(`${helpers}; return { preferProvider, YOUTUBE_PROVIDER };`)();
}

test("provider preference keeps fallback meals when provider pool is too small", () => {
  const { preferProvider, YOUTUBE_PROVIDER } = loadProviderPreference();
  const recipes = [
    { id: "youtube-breakfast-burrito", provider: YOUTUBE_PROVIDER },
    { id: "egg-wrap", provider: "starter" },
    { id: "cottage-toast", provider: "starter" },
    { id: "chia-protein-pudding", provider: "starter" }
  ];

  assert.deepEqual(
    preferProvider(recipes, true).map((recipe) => recipe.id),
    ["youtube-breakfast-burrito", "egg-wrap", "cottage-toast", "chia-protein-pudding"]
  );
});

test("live recipes are merged with starter meals for rotation", () => {
  const source = fs.readFileSync("client.js", "utf8");
  assert.match(source, /mergeRecipes\(recipes\);/);
  assert.doesNotMatch(source, /recipeBank = recipes;/);
});

test("meal rotation uses a broad pool and remembers more than a handful of meals", () => {
  const source = fs.readFileSync("client.js", "utf8");

  assert.match(source, /const SELECTION_POOL_SIZE = 16;/);
  assert.match(source, /const RECENT_RECIPE_MEMORY = 36;/);
  assert.match(source, /\.slice\(0, RECENT_RECIPE_MEMORY\)/);
});

test("YouTube discovery builds a large varied inventory", () => {
  const source = fs.readFileSync("server.js", "utf8");

  assert.match(source, /maxResults: "25"/);
  assert.match(source, /youtubeMealSearches\(\)/);
  assert.match(source, /mealsWithRecipeLimit\(combined, 12\)/);
  assert.doesNotMatch(source, /mealsWithRecipeLimit\(combined, 2\)/);
});

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

  assert.match(source, /maxResults: "50"/);
  assert.match(source, /youtubeMealSearches\(\)/);
  assert.match(source, /YOUTUBE_RECIPES_PER_MEAL = 30/);
  assert.match(source, /limitYoutubeVideosPerChannel/);
  assert.match(source, /\[meal, randomized\[0\], "relevance"\]/);
  assert.match(source, /\[meal, randomized\[1\], "date"\]/);
  assert.doesNotMatch(source, /mealsWithRecipeLimit\(combined, 12\)/);
});

test("YouTube extraction keeps one thumbnail-matched recipe per video", () => {
  const source = fs.readFileSync("server.js", "utf8");

  assert.match(source, /const recipesByVideo = new Map/);
  assert.match(source, /Return at most one meal-prep recipe per source video/);
  assert.match(source, /most likely to be represented by its official thumbnail/);
  assert.match(source, /meal: \{ type: "string", enum: \["Breakfast", "Lunch", "Dinner"\] \}/);
  assert.doesNotMatch(source, /Reject general meal-prep advice, meal plans/);
});

test("every meal type has at least five quick starter recipes", () => {
  const source = fs.readFileSync("client.js", "utf8");
  const start = source.indexOf("const starterRecipeBank = ") + "const starterRecipeBank = ".length;
  const end = source.indexOf("].map((recipe)", start) + 1;
  const recipes = new Function(`return ${source.slice(start, end)};`)();

  ["Breakfast", "Lunch", "Dinner"].forEach((meal) => {
    const quickMeals = recipes.filter((recipe) => recipe.meal === meal && recipe.minutes <= 30);
    assert.ok(quickMeals.length >= 5, `${meal} only has ${quickMeals.length} quick starter meals`);
  });
});

test("starter recipes use unique official YouTube thumbnails", () => {
  const source = fs.readFileSync("client.js", "utf8");
  const start = source.indexOf("const starterRecipeBank = ") + "const starterRecipeBank = ".length;
  const end = source.indexOf("].map((recipe)", start) + 1;
  const recipes = new Function(`return ${source.slice(start, end)};`)();
  const images = recipes.map((recipe) => recipe.image);

  assert.equal(new Set(images).size, recipes.length);
  recipes.forEach((recipe) => {
    assert.match(recipe.image, /^https:\/\/i\.ytimg\.com\/vi\/[\w-]+\/hqdefault\.jpg$/);
    assert.match(recipe.sourceUrl, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+$/);
  });
});

test("live recipe merging rejects missing and duplicate photos", () => {
  const source = fs.readFileSync("client.js", "utf8");

  assert.match(source, /!isTrustedRecipePhoto\(recipe\)/);
  assert.match(source, /existingImages\.has\(imageKey\)/);
  assert.match(source, /!currentImages\.has\(recipeImageKey\(recipe\)\)/);
});

test("meal swaps retain other providers as fallbacks", () => {
  const source = fs.readFileSync("client.js", "utf8");

  assert.match(source, /function prioritizeProviderForSwap/);
  assert.match(source, /return \[\.\.\.preferredProvider, \.\.\.otherProviders\];/);
  assert.doesNotMatch(source, /preferProvider\(quickRecipes, useYoutube, false\)/);
});

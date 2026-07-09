const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("unapproved Instacart panel is absent from the product UI", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.doesNotMatch(html, /Live Instacart products|instacart-panel|load-instacart-products/);
  assert.doesNotMatch(client, /instacartPanel|loadInstacartProducts|renderInstacartProducts/);
});

test("production-facing source status avoids starter and temporary wording", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(html, /Recipe sources are ready\./);
  assert.doesNotMatch(html, /Using starter recipe data/);
  assert.doesNotMatch(client, /temporarily unavailable/);
  assert.match(client, /Using curated recipe data/);
});

test("cost comparison never renders fake store address fallbacks", () => {
  const client = fs.readFileSync("client.js", "utf8");
  const server = fs.readFileSync("server.js", "utf8");

  assert.doesNotMatch(client, /Address unavailable/);
  assert.doesNotMatch(client, /fallbackStores/);
  assert.doesNotMatch(client, /showing starter estimates/);
  assert.match(client, /store\.address/);
  assert.match(server, /postal_code:\$\{zip\}\|country:US/);
  assert.match(server, /\$\{zip\}, USA/);
  assert.match(server, /No nearby grocery stores with verified addresses/);
  assert.match(server, /fetchGooglePlacesLegacyTextSearch/);
  assert.match(server, /grocery stores near/);
  assert.doesNotMatch(server, /fallbackStorePayload/);
});

test("curated recipes cannot render unverified stock photos", () => {
  const client = fs.readFileSync("client.js", "utf8");
  const server = fs.readFileSync("server.js", "utf8");

  assert.doesNotMatch(client, /images\.unsplash/);
  assert.doesNotMatch(client, /image: ""/);
  assert.doesNotMatch(client, />Meal Prep</);
  assert.match(client, /function recipeImage\(recipe\)/);
  assert.match(client, /function isTrustedRecipePhoto\(recipe = \{\}\)/);
  assert.match(client, /function starterRecipeThumbnail\(recipe = \{\}\)/);
  assert.match(client, /\/assets\/recipe-fallbacks\/\$\{meal\.toLowerCase\(\)\}\.jpg/);
  assert.doesNotMatch(client, /function thumbnailScene/);
  assert.match(client, /image: recipe\.image \|\| starterRecipeThumbnail\(recipe\)/);
  assert.match(client, /image\.src = recipeImage\(item\)/);
  assert.match(server, /youtube\/v3\/search/);
  assert.match(server, /function officialYoutubeThumbnail/);
  assert.match(server, /image: video\.image/);
});

test("low-carb starter recipes use vetted YouTube thumbnails", () => {
  const client = fs.readFileSync("client.js", "utf8");

  ["5s0eRgZjlwU", "uGMEn_8T__M", "pjWjLkQmCTw"].forEach((videoId) => {
    assert.match(client, new RegExp(`https://i\\.ytimg\\.com/vi/${videoId}/hqdefault\\.jpg`));
  });
  assert.match(client, /provider: "YouTube \+ AI"/);
});

test("restored plans refresh stale recipe thumbnails", () => {
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(client, /function refreshPlanAssets\(plan\)/);
  assert.match(client, /currentPlan = refreshPlanAssets\(saved\.plan\)/);
  assert.match(client, /currentPlan = refreshPlanAssets\(entry\.plan\)/);
  assert.match(client, /currentPlan = refreshPlanAssets\(latestPlan\.plan\)/);
});

test("server fallback inventory has at least five recipes per meal type", () => {
  const server = fs.readFileSync("server.js", "utf8");
  const start = server.indexOf("const curatedYoutubeRecipes = [");
  const end = server.indexOf("];", start);
  const inventory = server.slice(start, end);

  ["breakfast", "lunch", "dinner"].forEach((meal) => {
    const matches = inventory.match(new RegExp(`id: "youtube-${meal}-`, "g")) || [];
    assert.ok(matches.length >= 5, `${meal} fallback has only ${matches.length} recipes`);
  });
});

test("server recipe discovery includes air fryer meal-prep variety", () => {
  const server = fs.readFileSync("server.js", "utf8");

  assert.match(server, /Air Fryer Egg White Bites/);
  assert.match(server, /Air Fryer Chicken Rice Bowls/);
  assert.match(server, /Air Fryer Salmon Sweet Potato Bowls/);
  assert.match(server, /air fryer dinner meal prep recipes/);
});

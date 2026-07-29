const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("budget page includes low calorie and low carb preferences", () => {
  const html = fs.readFileSync("index.html", "utf8");

  assert.match(html, /id="pref-low-calorie" value="low-calorie"/);
  assert.match(html, /<label for="pref-low-calorie">Low calorie<\/label>/);
  assert.match(html, /id="pref-low-carb" value="low-carb"/);
  assert.match(html, /<label for="pref-low-carb">Low carb<\/label>/);
});

test("budget page includes selectable meal plan lengths", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(html, /name="planDays" id="plan-days-1" value="1"/);
  assert.match(html, /<label for="plan-days-1">1 day<\/label>/);
  assert.match(html, /name="planDays" id="plan-days-5" value="5" checked/);
  assert.match(html, /<label for="plan-days-5">5 day bulk<\/label>/);
  assert.match(html, /name="planDays" id="plan-days-7" value="7"/);
  assert.match(html, /<label for="plan-days-7">7 day bulk<\/label>/);
  assert.match(client, /PLAN_DAY_OPTIONS = \[1, 5, 7\]/);
  assert.match(client, /planDays: normalizePlanDays/);
});

test("meal page title reflects the selected plan length", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(html, /id="meal-plan-title" class="primary-page-title">5 Day Bulk Meal Plan<\/h2>/);
  assert.match(client, /function mealPlanTitleText\(days\)/);
  assert.match(client, /"1 Day Meal Plan"/);
  assert.match(client, /\$\{normalizedDays\} Day Bulk Meal Plan/);
  assert.match(client, /updateMealPlanHeading\(prefs\)/);
});

test("recipe provider preferences include low calorie and low carb", () => {
  const server = fs.readFileSync("server.js", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(server, /"low-calorie": \{ maxCalories: "500" \}/);
  assert.match(server, /"low-carb": \{ maxCarbs: "20" \}/);
  assert.match(server, /"low-calorie": "low calorie"/);
  assert.match(server, /"low-carb": "low carb"/);
  assert.match(server, /"low-calorie", "low-carb"/);
  assert.match(client, /preference === "low-calorie"/);
  assert.match(client, /preference === "low-carb"/);
});

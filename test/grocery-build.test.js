const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

function loadBuildGroceries() {
  const source = fs.readFileSync("client.js", "utf8");
  const start = source.indexOf("function isKitchenStapleIngredient");
  const end = source.indexOf("\nconst STORE_PACKAGE_RULES", start);

  if (start === -1 || end === -1) {
    throw new Error("Could not load grocery builder");
  }

  const helpers = source.slice(start, end);
  return new Function(`const PLAN_DAY_OPTIONS = [1, 5, 7]; const DEFAULT_PLAN_DAYS = 5; function normalizePlanDays(value) { const days = Number(value); return PLAN_DAY_OPTIONS.includes(days) ? days : DEFAULT_PLAN_DAYS; } ${helpers}; return { buildGroceries, isKitchenStapleIngredient };`)();
}

test("grocery builder excludes water from shopping list", () => {
  const { buildGroceries, isKitchenStapleIngredient } = loadBuildGroceries();
  const groceries = buildGroceries([
    {
      ingredients: [
        ["water", 1, "cup", "pantry"],
        ["warm water", 0.5, "cup", "pantry"],
        ["chicken breast", 0.5, "lb", "meat"]
      ]
    }
  ], { people: 2, planDays: 5 });

  assert.equal(isKitchenStapleIngredient("filtered water"), true);
  assert.equal(isKitchenStapleIngredient("watermelon"), false);
  assert.equal(groceries.size, 1);
  assert.equal([...groceries.values()][0].name, "chicken breast");
  assert.equal([...groceries.values()][0].amount, 5);
});

test("grocery builder scales quantities by selected plan days", () => {
  const { buildGroceries } = loadBuildGroceries();
  const groceries = buildGroceries([
    {
      ingredients: [
        ["chicken breast", 0.5, "lb", "meat"]
      ]
    }
  ], { people: 2, planDays: 7 });

  assert.equal([...groceries.values()][0].amount, 7);
});

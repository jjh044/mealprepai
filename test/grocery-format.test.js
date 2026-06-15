const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

function loadGroceryFormatter() {
  const source = fs.readFileSync("client.js", "utf8");
  const start = source.indexOf("const STORE_PACKAGE_RULES =");
  const end = source.indexOf("\nfunction mergeRecipes", start);

  function formatAmount(amount) {
    const rounded = Math.round(amount * 4) / 4;
    return Number.isInteger(rounded) ? String(rounded) : String(rounded.toFixed(2)).replace(/0$/, "");
  }

  const scope = { formatAmount };
  const factory = new Function(
    "scope",
    `const { formatAmount } = scope; ${source.slice(start, end)}; return { storeQuantityFor };`
  );
  return factory(scope).storeQuantityFor;
}

test("grocery quantities use store package counts for tortillas and wraps", () => {
  const storeQuantityFor = loadGroceryFormatter();

  assert.equal(
    storeQuantityFor({ name: "low-carb tortillas", amount: 10, unit: "each", category: "bakery" }),
    "1- 10-count package"
  );
  assert.equal(
    storeQuantityFor({ name: "whole wheat", amount: 10, unit: "wraps", category: "bakery" }),
    "1- 10-count package"
  );
  assert.equal(
    storeQuantityFor({ name: "large", amount: 20, unit: "tortillas", category: "bakery" }),
    "2- 10-count packages"
  );
});

test("grocery package sizes are separated from package counts", () => {
  const storeQuantityFor = loadGroceryFormatter();

  assert.equal(
    storeQuantityFor({ name: "shredded cheddar cheese", amount: 2, unit: "cup", category: "dairy" }),
    "1- 8 oz bag"
  );
  assert.equal(
    storeQuantityFor({ name: "low-carb tortillas", amount: 10, unit: "each", category: "bakery" }),
    "1- 10-count package"
  );
  assert.equal(
    storeQuantityFor({ name: "rice", amount: 5, unit: "cup", category: "pantry" }),
    "1 bag"
  );
});

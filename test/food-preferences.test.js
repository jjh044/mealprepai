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

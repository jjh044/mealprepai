const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");

test("unapproved Instacart panel is hidden by default", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(html, /<section class="instacart-panel" hidden>/);
  assert.match(client, /instacartPanel\.hidden = appConfig\.instacartProductsEnabled !== true/);
});

test("production-facing source status avoids starter and temporary wording", () => {
  const html = fs.readFileSync("index.html", "utf8");
  const client = fs.readFileSync("client.js", "utf8");

  assert.match(html, /Recipe sources are ready\./);
  assert.doesNotMatch(html, /Using starter recipe data/);
  assert.doesNotMatch(client, /temporarily unavailable/);
  assert.match(client, /Using curated recipe data/);
});

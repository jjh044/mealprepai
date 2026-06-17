const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const staticFiles = [
  "index.html",
  "styles.css",
  "client.js",
  "subscription.js",
  "native-store.js",
  "privacy.html",
  "terms.html",
  "support.html",
  "partners.html",
];

function main() {
  fs.rmSync(dist, { force: true, recursive: true });
  fs.mkdirSync(dist, { recursive: true });

  for (const filename of [...staticFiles, "cloud.js", "telemetry.js", "native-runtime.js"]) {
    fs.copyFileSync(path.join(root, filename), path.join(dist, filename));
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

module.exports = main;

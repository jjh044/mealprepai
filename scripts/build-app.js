const path = require("node:path");
const esbuild = require("esbuild");
const buildWeb = require("./build-web");

const root = path.resolve(__dirname, "..");

const bundles = [
  ["src/cloud-bridge.jsx", "cloud.js"],
  ["src/telemetry.js", "telemetry.js"],
  ["src/native-runtime.js", "native-runtime.js"],
];

for (const [entry, outfile] of bundles) {
  esbuild.buildSync({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    minify: true,
    format: "iife",
    outfile: path.join(root, outfile),
  });
}

buildWeb();

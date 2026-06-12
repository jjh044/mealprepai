const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const storeRoot = path.join(root, "app-store", "android");
const screenshotSource = path.join(root, "app-store", "screenshots");
const screenshotOutput = path.join(storeRoot, "screenshots");
const iconSource = path.join(root, "app-store", "assets", "app-icon-1024.png");

async function main() {
  fs.mkdirSync(screenshotOutput, { recursive: true });
  const screenshots = fs.readdirSync(screenshotSource)
    .filter((name) => /^\d{2}-.*\.png$/.test(name))
    .sort();

  for (const name of screenshots) {
    await sharp(path.join(screenshotSource, name))
      .resize(1080, 1920, { fit: "cover", position: "top" })
      .png()
      .toFile(path.join(screenshotOutput, name));
  }

  await sharp(iconSource)
    .resize(512, 512)
    .png()
    .toFile(path.join(storeRoot, "play-icon-512.png"));

  const featureBackground = Buffer.from(`
    <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="green" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#0d4f2d"/>
          <stop offset="1" stop-color="#2f7c57"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#green)"/>
      <circle cx="820" cy="250" r="220" fill="#ffffff" opacity="0.08"/>
      <text x="72" y="205" fill="#ffffff" font-family="Arial, sans-serif"
        font-size="76" font-weight="700">PrepWise</text>
      <text x="76" y="274" fill="#e9f5ed" font-family="Arial, sans-serif"
        font-size="34">Meal Prep Without Thinking</text>
      <text x="76" y="332" fill="#cfe7d7" font-family="Arial, sans-serif"
        font-size="24">Plan five days. Shop one list. Stay on budget.</text>
    </svg>
  `);
  const featureIcon = await sharp(iconSource).resize(380, 380).png().toBuffer();
  await sharp(featureBackground)
    .composite([{ input: featureIcon, left: 620, top: 60 }])
    .png()
    .toFile(path.join(storeRoot, "feature-graphic-1024x500.png"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

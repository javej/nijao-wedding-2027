/**
 * Renders invitation.html to print-ready files:
 *   - jave-and-nianne-wedding-invitation.pdf  (true 5×7in page)
 *   - jave-and-nianne-wedding-invitation.jpg  (1440×2016 px, ≈288 DPI)
 *
 * Usage: node generate.mjs
 * Requires the `playwright` package with the Chromium browser installed.
 */
import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(dir, "invitation.html");

// PLAYWRIGHT_CHROMIUM points at a Chrome/Chromium binary when the
// playwright-managed download isn't available in the environment.
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || undefined,
});
const page = await browser.newPage({
  viewport: { width: 480, height: 672 },
  deviceScaleFactor: 3,
  // Webfont fetches go through the environment's TLS-intercepting proxy,
  // whose CA isn't in Chromium's bundled store.
  ignoreHTTPSErrors: true,
});

await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });
// Make sure the Google Fonts faces have actually been applied before capture.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);

await page.screenshot({
  path: path.join(dir, "jave-and-nianne-wedding-invitation.jpg"),
  type: "jpeg",
  quality: 95,
  fullPage: false,
});

await page.pdf({
  path: path.join(dir, "jave-and-nianne-wedding-invitation.pdf"),
  width: "5in",
  height: "7in",
  printBackground: true,
  pageRanges: "1",
});

await browser.close();
console.log("Rendered invitation PDF + JPG");

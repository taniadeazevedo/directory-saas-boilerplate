/**
 * Captures the marketing screenshots for the marketplace listing at a fixed
 * 1600x800 viewport. Run against a local dev server seeded with both
 * `npm run db:seed` and `npx tsx scripts/seed-showcase.ts`.
 *
 * Usage: npx tsx scripts/capture-screenshots.ts [outputDir]
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = process.argv[2] ?? "./scratchpad-screenshots";
const WIDTH = 1600;
const HEIGHT = 800;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT } });
  const page = await context.newPage();

  async function shoot(name: string, fullPage = false) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage });
    console.log(`  ✓ ${name}.png`);
  }

  async function login(email: string, password: string) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  }

  // 1. Landing / hero
  console.log("1/8 Landing page");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await shoot("01-landing");

  // 2. Directory grid — filters + Featured badges + favorite hearts
  console.log("2/8 Directory grid");
  await page.goto(`${BASE_URL}/directory`, { waitUntil: "networkidle" });
  await shoot("02-directory-grid");

  // 3. Listing detail — gallery, claim, reviews
  console.log("3/8 Listing detail");
  await page.goto(`${BASE_URL}/directory/flowsync`, { waitUntil: "networkidle" });
  await shoot("03-listing-detail", true);

  // 4. Pricing
  console.log("4/8 Pricing");
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
  await shoot("04-pricing");

  // 5. Admin — dark mode, metrics + moderation
  console.log("5/8 Admin (dark mode)");
  await login("admin@example.com", "admin1234");
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
  // Toggle to dark mode via the theme button in the navbar.
  await page.click('button[aria-label="Change theme"]').catch(() => {});
  await page.waitForTimeout(300);
  await shoot("05-admin-dark");

  // 6. Admin listings — Featured toggle + CSV export visible
  console.log("6/8 Admin listings");
  await page.goto(`${BASE_URL}/admin/listings`, { waitUntil: "networkidle" });
  await shoot("06-admin-listings-dark");

  // 7. Dashboard — user's own listings + analytics columns
  console.log("7/8 Dashboard");
  await page.click('button[aria-label="Change theme"]').catch(() => {}); // back to light
  await page.waitForTimeout(300);
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await shoot("07-dashboard");

  // 8. Bookmarks
  console.log("8/8 Bookmarks");
  await page.goto(`${BASE_URL}/dashboard/bookmarks`, { waitUntil: "networkidle" });
  await shoot("08-bookmarks");

  await browser.close();
  console.log(`\nDone. Screenshots in ${path.resolve(OUT_DIR)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/ui.md
 *
 * Each screenshot captures a meaningful UI state described in the docs.
 * Output: assets/screenshots/docs/ui/
 */

const OUT = path.resolve("assets/screenshots/docs/ui");

const TEST_HASH = "#map=18/50.653900/-128.009400";

const withViewStorage = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      "navigator_view_app",
      JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
    ),
  );

// Desktop viewport used across most screenshots in this file
test.use({ viewport: { width: 1280, height: 720 } });

test("useUI / Panel — desktop returning visit", async ({ page }) => {
  await withViewStorage(page);
  await page.goto(`/${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  // Wait for panel slide-in to complete
  await page.locator(".navigator-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `${OUT}/panel.png`,
  });
});

test("useUI / Responsive breakpoints — mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await withViewStorage(page);
  await page.goto(`/${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  await page.screenshot({
    path: `${OUT}/mobile.png`,
  });
});

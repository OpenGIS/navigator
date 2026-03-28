import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/guide/core.md
 *
 * Captures the first-load Welcome modal, the About panel, and the Privacy panel.
 * Output: assets/screenshots/docs/core/
 */

const OUT = path.resolve("assets/screenshots/docs/core");

const withNoViewStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_view_app"));

const withViewStorage = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      "navigator_view_app",
      JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
    ),
  );

// Desktop viewport
test.use({ viewport: { width: 1280, height: 720 } });

test("First load / Welcome modal — desktop first visit", async ({ page }) => {
  await withNoViewStorage(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.locator("#about-modal").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `${OUT}/first-load.png`,
  });
});

test("About panel — desktop", async ({ page }) => {
  await withViewStorage(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.locator("#about-button").click();
  await page.locator(".navigator-about-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `${OUT}/about-panel.png`,
  });
});

test("Privacy panel — desktop", async ({ page }) => {
  await withViewStorage(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.locator("#privacy-button").click();
  await page.locator(".navigator-privacy-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `${OUT}/privacy-panel.png`,
  });
});

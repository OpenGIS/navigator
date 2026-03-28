import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/guide/map.md
 *
 * Each screenshot captures a meaningful UI state described in the docs.
 * Output: assets/screenshots/docs/map/
 */

const OUT = path.resolve("assets/screenshots/docs/map");

const TEST_HASH = "#map=18/50.653900/-128.009400";

const withNoViewStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_view_app"));

test.use({ viewport: { width: 1280, height: 720 } });

test("useMap / URL hash — share link in menu", async ({ page }) => {
  await withNoViewStorage(page);
  await page.goto(`/${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  // Dismiss About modal (first-load)
  await page.locator("#about-modal-close").click();
  await page.locator("#about-modal").waitFor({ state: "hidden" });

  await page.locator(".navigator-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `${OUT}/url-hash.png`,
  });
});

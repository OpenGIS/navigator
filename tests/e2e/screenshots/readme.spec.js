import { test } from "@playwright/test";

/**
 * README screenshot — assets/screenshots/app-preview.png
 *
 * Captures the app in desktop mode on initial load (first visit, panel open,
 * first-load alert visible) at the standard test view to use as the main
 * README preview image.
 */

// Standard test view — Port Hardy area, BC
const TEST_HASH = "#map=18/50.653900/-128.009400";

test.use({ viewport: { width: 1280, height: 720 } });

test("README — desktop initial load", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("navigator_view_app"));
  await page.goto(`/${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  // Wait for panel slide-in to complete
  await page.locator(".navigator-panel").waitFor({ state: "visible" });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: "assets/screenshots/app-preview.png",
  });
});

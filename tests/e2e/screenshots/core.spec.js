import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/core.md
 *
 * Captures the first-load Welcome modal.
 * Output: assets/screenshots/docs/core/
 */

const OUT = path.resolve("assets/screenshots/docs/core");

const withNoViewStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_view_app"));

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

import { test, expect } from "@playwright/test";
import path from "path";

// Bootstrap offcanvas transition is 300ms — allow extra headroom.
const TRANSITION_TIMEOUT = 1000;

test.describe("Locate Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  // This test documents the desired behaviour: on a desktop viewport the locate
  // panel should be open immediately on initial load, including after its
  // slide-in transition completes.  It is expected to FAIL until the feature
  // is implemented.
  test("panel is open by default on desktop", async ({ page }) => {
    const panel = page.locator("#side-panel");

    // Panel should be visible without any user interaction
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Wait for the Bootstrap offcanvas slide-in transition to finish
    await expect(panel).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });

    // Locate panel content should already be rendered
    await expect(page.getByText("Current Location")).toBeVisible();
  });

  test("panel can be toggled closed and re-opened", async ({ page }) => {
    const panel = page.locator("#side-panel");
    const toggleButton = page.locator(".navbar-toggler");

    // On desktop the panel starts open — wait for it and its transition
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });

    // Verify that <panel> tag is NOT present (should be resolved to div#side-panel)
    await expect(page.locator("panel")).toHaveCount(0);

    // Content is already visible
    await expect(page.getByText("Current Location")).toBeVisible();

    // Take a screenshot with panel open
    const screenshotPath = path.resolve(
      process.cwd(),
      "assets/screenshots/locate-panel.png",
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Close panel via the navbar toggle
    await toggleButton.click();
    await expect(panel).toBeHidden({ timeout: TRANSITION_TIMEOUT });

    // Re-open via the navbar toggle
    await toggleButton.click();
    await expect(panel).toBeVisible({ timeout: TRANSITION_TIMEOUT });
    await expect(panel).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });
  });
});

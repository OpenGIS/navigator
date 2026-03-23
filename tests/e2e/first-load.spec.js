import { test, expect } from "@playwright/test";

const TRANSITION_TIMEOUT = 1000;

/**
 * Helpers to control navigator_view localStorage state before page load.
 * addInitScript runs before any page scripts, so it reliably seeds / clears storage.
 */
const withNoWaymarkStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_view"));

const withWaymarkStorage = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      "navigator_view",
      JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
    ),
  );

test.describe("First Load Alert", () => {
  test("alert is visible on first visit", async ({ page }) => {
    await withNoWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#first-load-alert")).toBeVisible();
    await expect(page.getByText("location button")).toBeVisible();
  });

  test("alert is absent on returning visit", async ({ page }) => {
    await withWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#first-load-alert")).toHaveCount(0);
  });

  test("alert is absent on reload once navigator_view is persisted", async ({
    page,
  }) => {
    // Fresh browser context already has empty localStorage — no init script needed.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#first-load-alert")).toBeVisible();

    // Simulate navigator_view being written (as useMap does on moveend)
    await page.evaluate(() => {
      localStorage.setItem(
        "navigator_view",
        JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
      );
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#first-load-alert")).toHaveCount(0);
  });

  test("alert can be dismissed", async ({ page }) => {
    await withNoWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#first-load-alert")).toBeVisible();

    // Click the dismiss (close) button
    await page.locator("#first-load-alert .btn-close").click();

    await expect(page.locator("#first-load-alert")).toHaveCount(0);
  });
});

test.describe("Panel Visibility on Initial Load", () => {
  test("panel is visible on desktop initial load", async ({ page }) => {
    await withNoWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const panel = page.locator("#side-panel");
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Bootstrap offcanvas slide-in should complete
    await expect(panel).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });
  });

  test("panel is visible on desktop returning load", async ({ page }) => {
    await withWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const panel = page.locator("#side-panel");
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });
  });
});

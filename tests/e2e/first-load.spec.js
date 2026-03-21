import { test, expect } from "@playwright/test";

const TRANSITION_TIMEOUT = 1000;

/**
 * Helpers to control navigator_waymark localStorage state before page load.
 * addInitScript runs before any page scripts, so it reliably seeds / clears storage.
 */
const withNoWaymarkStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_waymark"));

const withWaymarkStorage = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      "navigator_waymark",
      JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
    ),
  );

test.describe("First Load Detection", () => {
  test("isFirstLoad is true on first visit — #content has first-load class", async ({
    page,
  }) => {
    await withNoWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#content")).toHaveClass(/first-load/);
  });

  test("isFirstLoad is false on returning visit — #content has no first-load class", async ({
    page,
  }) => {
    await withWaymarkStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#content")).not.toHaveClass(/first-load/);
  });

  test("first-load class is absent on reload once navigator_waymark is persisted", async ({
    page,
  }) => {
    // Fresh browser context already has empty localStorage — no init script needed.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Confirm we start in first-load state
    await expect(page.locator("#content")).toHaveClass(/first-load/);

    // Simulate navigator_waymark being written (as useWaymark does on moveend)
    await page.evaluate(() => {
      localStorage.setItem(
        "navigator_waymark",
        JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
      );
    });

    // On the next page load, navigator_waymark exists — isFirstLoad must be false
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#content")).not.toHaveClass(/first-load/);
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

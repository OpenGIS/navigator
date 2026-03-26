import { test, expect } from "@playwright/test";

/**
 * Tests for docs/ui.md
 *
 * Covers useUI (responsive breakpoints, panel actions, first load).
 */

const TRANSITION_TIMEOUT = 1000;

const withNoViewStorage = (page) =>
  page.addInitScript(() => localStorage.removeItem("navigator_view_app"));

const withViewStorage = (page) =>
  page.addInitScript(() =>
    localStorage.setItem(
      "navigator_view_app",
      JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
    ),
  );

/** Dismiss the About modal if it appears (first-load state). */
const dismissAboutModal = async (page) => {
  const modal = page.locator("#about-modal");
  if (await modal.isVisible().catch(() => false)) {
    await page.locator("#about-modal-close").click();
    await expect(modal).toBeHidden();
  }
};

// ─── useUI / Responsive breakpoints ──────────────────────────────────────────

test.describe("useUI / Responsive breakpoints", () => {
  test("panel opens automatically on desktop (>=992px)", async ({ page }) => {
    // Playwright's default Desktop Chrome viewport is 1280×720
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".navigator-panel")).toHaveCSS("transform", "none", {
      timeout: TRANSITION_TIMEOUT,
    });
  });

  test("panel is not auto-opened on mobile (<768px)", async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 600 });
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // On mobile the panel starts closed
    await expect(page.locator(".navigator-panel")).toBeHidden({ timeout: TRANSITION_TIMEOUT });
  });
});

// ─── useUI / Panel ────────────────────────────────────────────────────────────

test.describe("useUI / Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissAboutModal(page);
  });

  test("openPanel — panel is visible after opening on desktop", async ({ page }) => {
    const panel = page.locator(".navigator-panel");

    // App opens the panel automatically on desktop via openPanel
    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel).toHaveCSS("transform", "none", { timeout: TRANSITION_TIMEOUT });
  });

  test("togglePanel — closes and reopens the panel", async ({ page }) => {
    const panel = page.locator(".navigator-panel");
    const toggle = page.locator(".navbar-toggler");

    await expect(panel).toBeVisible({ timeout: 5000 });
    await expect(panel).toHaveCSS("transform", "none", { timeout: TRANSITION_TIMEOUT });

    // Close the panel
    await toggle.click();
    await expect(panel).toBeHidden({ timeout: TRANSITION_TIMEOUT });

    // Reopen the panel
    await toggle.click();
    await expect(panel).toBeVisible({ timeout: TRANSITION_TIMEOUT * 3 });
    await expect(panel).toHaveCSS("transform", "none", { timeout: TRANSITION_TIMEOUT * 3 });
  });

  test("closePanel — panel closes on toggle click", async ({ page }) => {
    const panel = page.locator(".navigator-panel");
    const toggle = page.locator(".navbar-toggler");

    await expect(panel).toBeVisible({ timeout: 5000 });

    await toggle.click();
    await expect(panel).toBeHidden({ timeout: TRANSITION_TIMEOUT });
  });
});

// ─── useUI / First load ───────────────────────────────────────────────────────

test.describe("useUI / First load", () => {
  test("about modal is visible on first visit", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#about-modal")).toBeVisible();
    await expect(page.getByText("About Navigator")).toBeVisible();
    await expect(page.getByText("menu")).toBeVisible();
  });

  test("about modal is absent on returning visit", async ({ page }) => {
    await withViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#about-modal")).toHaveCount(0);
  });

  test("about modal is absent after view storage is written and page is reloaded", async ({ page }) => {
    const VIEW_KEY = "navigator_view_app";

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#about-modal")).toBeVisible();

    // Dismiss the modal
    await page.locator("#about-modal-close").click();
    await expect(page.locator("#about-modal")).toHaveCount(0);

    // Simulate useMap writing the view key (as it does on moveend)
    await page.evaluate((k) => {
      localStorage.setItem(
        k,
        JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
      );
    }, VIEW_KEY);

    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#about-modal")).toHaveCount(0);
  });

  test("about modal can be dismissed", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#about-modal")).toBeVisible();

    await page.locator("#about-modal-close").click();

    await expect(page.locator("#about-modal")).toHaveCount(0);
  });

  test("about button in menu opens the about modal", async ({ page }) => {
    await withViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#about-modal")).toHaveCount(0);

    await page.locator("#about-button").click();
    await expect(page.locator("#about-modal")).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

/**
 * Tests for docs/map.md
 *
 * Covers useMap (URL hash, map lifecycle, view persistence, mapOptions).
 */

const VIEW_KEY = "navigator_view_app";

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

// ─── useMap / URL hash ────────────────────────────────────────────────────────

test.describe("useMap / URL hash", () => {
  test("URL hash sets initial map view on load", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/#map=18/50.653900/-128.009400");
    await page.waitForLoadState("networkidle");

    // Hash should remain present after load
    await expect(page).toHaveURL(/#map=/);
    expect(page.url()).toContain("/50.6539");
  });

  test("URL hash is written on initial map load", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Hash should be set after the map loads and calls syncView
    await expect
      .poll(() => page.url(), { timeout: 5000 })
      .toMatch(/#map=/);
  });

  test("URL hash updates when the map is panned", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/#map=10/51.500000/-0.100000");
    await page.waitForLoadState("networkidle");
    await dismissAboutModal(page);

    const initialUrl = page.url();

    const canvas = page.locator(".navigator-map canvas");
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 200, y: 200 },
      targetPosition: { x: 400, y: 200 },
    });

    // Hash should change after panning (throttled to 1 s)
    await expect
      .poll(() => page.url(), { timeout: 5000 })
      .not.toBe(initialUrl);
    expect(page.url()).toMatch(/#map=/);
  });

  test("menu hides current view section on initial load with no hash", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Panel is open on desktop but "Current view" section must not be visible
    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Current view")).toBeHidden();
    await expect(page.locator(".navigator-share-link")).toBeHidden();
  });

  test("menu shows current view section after the map is panned", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await dismissAboutModal(page);

    await expect(page.getByText("Current view")).toBeHidden();

    const canvas = page.locator(".navigator-map canvas");
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 200, y: 200 },
      targetPosition: { x: 400, y: 200 },
    });

    // Section appears after first moveend (throttled to 1 s)
    await expect
      .poll(() => page.getByText("Current view").isVisible(), { timeout: 5000 })
      .toBe(true);
    await expect(page.locator(".navigator-share-link")).toBeVisible();
  });

  test("menu shows current coordinates", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/#map=18/50.653900/-128.009400");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });

    // Coordinates section should be visible
    await expect(page.getByText("Current view")).toBeVisible();
    await expect(page.getByText(/50\.\d+/)).toBeVisible();
  });

  test("menu share link contains current hash", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/#map=18/50.653900/-128.009400");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });

    const shareLink = page.locator(".navigator-share-link");
    await expect(shareLink).toBeVisible();

    const href = await shareLink.getAttribute("href");
    expect(href).toMatch(/#map=/);
    expect(href).toContain("/50.6539");
  });

  test("share position checkbox is hidden when locate permission was never granted", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/#map=18/50.653900/-128.009400");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#share-position-toggle")).toBeHidden();
  });

  test("share position checkbox is visible when locate permission was previously granted", async ({ page }) => {
    await withNoViewStorage(page);
    // Seed permissionGranted in locate storage
    await page.addInitScript(() => {
      localStorage.setItem(
        "navigator_locate_app",
        JSON.stringify({ permissionGranted: true }),
      );
    });
    await page.goto("/#map=18/50.653900/-128.009400");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".navigator-panel")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("#share-position-toggle")).toBeVisible();
  });
});

// ─── useMap / Initialising the map ───────────────────────────────────────────

test.describe("useMap / Initialising the map", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("map canvas is visible", async ({ page }) => {
    await expect(page.locator(".navigator-map canvas")).toBeVisible();
  });

  test("top bar is overlaid on the map", async ({ page }) => {
    const topNav = page.locator(".navigator-top .navbar");
    await expect(topNav).toBeVisible();

    // Top bar must have a higher z-index than the map (which is 1)
    const zIndex = await page.locator(".navigator-top").evaluate((el) =>
      window.getComputedStyle(el).zIndex,
    );
    expect(parseInt(zIndex)).toBeGreaterThan(1);

    // Top bar must have a visible background (not transparent)
    const bg = await topNav.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toBe("transparent");
  });
});

// ─── useMap / View persistence ───────────────────────────────────────────────

test.describe("useMap / View persistence", () => {
  test("saves center and zoom to localStorage after map movement", async ({ page }) => {
    await withNoViewStorage(page);
    await page.goto("/");
    await expect(page.locator(".navigator-map canvas")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await dismissAboutModal(page);

    // No view persisted yet
    const initial = await page.evaluate((k) => localStorage.getItem(k), VIEW_KEY);
    expect(initial).toBeNull();

    // Pan the map to trigger a moveend event and subsequent storage write
    const canvas = page.locator(".navigator-map canvas");
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 200, y: 200 },
      targetPosition: { x: 260, y: 200 },
    });

    // Poll until the 1 s throttle completes
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), VIEW_KEY), {
        timeout: 5000,
      })
      .not.toBeNull();

    const parsed = JSON.parse(
      await page.evaluate((k) => localStorage.getItem(k), VIEW_KEY),
    );
    expect(parsed.mapView).toHaveProperty("center");
    expect(typeof parsed.mapView.zoom).toBe("number");
  });

  test("restores saved view on page reload", async ({ page }) => {
    const savedZoom = 14;
    await page.addInitScript(({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    }, {
      key: VIEW_KEY,
      data: { mapView: { center: { lat: 51.5, lng: -0.12 }, zoom: savedZoom } },
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The stored view must not be cleared on load — the map reads and applies it
    const stored = await page.evaluate((k) => {
      const s = localStorage.getItem(k);
      return s ? JSON.parse(s) : null;
    }, VIEW_KEY);

    expect(stored).not.toBeNull();
    expect(stored.mapView.zoom).toBe(savedZoom);
  });
});

// ─── useMap / mapOptions ──────────────────────────────────────────────────────

test.describe("useMap / mapOptions", () => {
  test("default OpenFreeMap bright style loads attribution control", async ({ page }) => {
    // Navigator defaults to the OpenFreeMap bright style when no mapOptions are passed.
    // A successfully loaded style causes MapLibre to render the attribution control.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".maplibregl-ctrl-attrib")).toBeVisible();
  });
});

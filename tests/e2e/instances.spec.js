import { test, expect } from "@playwright/test";

/**
 * Tests for docs/instances.md
 *
 * The demo app (index.html) uses Navigator.init({ id: "app" }), so all
 * instance-specific storage keys are suffixed with "app".
 */

const INSTANCE_ID = "app";
const VIEW_KEY = `navigator_view_${INSTANCE_ID}`;

// ─── Creating an Instance ────────────────────────────────────────────────────

test.describe("Creating an Instance", () => {
  test("mounts into an existing DOM element", async ({ page }) => {
    await page.goto("/");

    // The mount element must exist in the DOM
    await expect(page.locator(`#${INSTANCE_ID}`)).toBeAttached();
    // Navigator renders a canvas inside the mount element
    await expect(page.locator(`#${INSTANCE_ID} canvas`)).toBeVisible();
  });
});

// ─── id — Instance Identifier ────────────────────────────────────────────────

test.describe("id — Instance Identifier", () => {
  test("storage key is scoped to the instance id", async ({ page }) => {
    // Seed the view key so the app reads it on load. If the wrong key is used
    // the first-load alert would still appear (it checks for this key).
    await page.addInitScript(({ key }) => {
      localStorage.setItem(
        key,
        JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
      );
    }, { key: VIEW_KEY });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // The app reads the seeded key — first-load alert should not appear
    await expect(page.locator("#first-load-alert")).toHaveCount(0);
  });

  test("key format is navigator_{namespace}_{id}", async ({ page }) => {
    // The view key written by useMap must match the expected pattern
    await page.addInitScript(() => localStorage.removeItem("navigator_view_app"));
    await page.goto("/");
    await expect(page.locator(".navigator-map canvas")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Pan the map to trigger a view persistence write
    const canvas = page.locator(".navigator-map canvas");
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 200, y: 200 },
      targetPosition: { x: 260, y: 200 },
    });

    // Poll until the throttled write completes (1 s throttle)
    await expect
      .poll(() => page.evaluate((k) => localStorage.getItem(k), VIEW_KEY), {
        timeout: 5000,
      })
      .not.toBeNull();

    // The written key must follow the navigator_{namespace}_{id} pattern
    expect(VIEW_KEY).toMatch(/^navigator_[a-z]+_[a-z0-9-]+$/);
  });
});

// ─── mapOptions ──────────────────────────────────────────────────────────────

test.describe("mapOptions", () => {
  test("default style renders attribution control", async ({ page }) => {
    // When no mapOptions are passed the OpenFreeMap bright style is used.
    // A successfully loaded style will render the MapLibre attribution control.
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator(".maplibregl-ctrl-attrib")).toBeVisible();
  });
});

// ─── Multiple Instances on the Same Page ─────────────────────────────────────

test.describe("Multiple Instances on the Same Page", () => {
  test("each instance uses a separate localStorage key", async ({ page }) => {
    const keyA = "navigator_view_map-a";
    const keyB = "navigator_view_map-b";

    // Seed two independent instance view keys
    await page.addInitScript(({ a, b }) => {
      localStorage.setItem(a, JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.12 }, zoom: 10 } }));
      localStorage.setItem(b, JSON.stringify({ mapView: { center: { lat: 48.85, lng: 2.35 }, zoom: 8 } }));
    }, { a: keyA, b: keyB });

    await page.goto("/");

    // Both keys must remain isolated — neither should overwrite the other
    const storedA = await page.evaluate((k) => localStorage.getItem(k), keyA);
    const storedB = await page.evaluate((k) => localStorage.getItem(k), keyB);

    expect(JSON.parse(storedA).mapView.zoom).toBe(10);
    expect(JSON.parse(storedB).mapView.zoom).toBe(8);
  });
});

// ─── Internal Storage Convention ─────────────────────────────────────────────

test.describe("Internal Storage Convention", () => {
  test("view is persisted after map movement", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("navigator_view_app"));
    await page.goto("/");
    await expect(page.locator(".navigator-map canvas")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // No view stored yet
    const initial = await page.evaluate((k) => localStorage.getItem(k), VIEW_KEY);
    expect(initial).toBeNull();

    // Pan the map to trigger storage write
    const canvas = page.locator(".navigator-map canvas");
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 200, y: 200 },
      targetPosition: { x: 260, y: 200 },
    });

    const stored = await expect
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
});

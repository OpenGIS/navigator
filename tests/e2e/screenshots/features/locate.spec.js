import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/features/locate.md
 *
 * Captures locate UI states: modals, button modes, map markers, and navbar badge.
 * Output: assets/screenshots/docs/features/locate/
 */

const OUT = path.resolve("assets/screenshots/docs/features/locate");

const TEST_HASH = "#map=18/50.653900/-128.009400";

const withNoLocateStorage = (page) =>
    page.addInitScript(() => {
        localStorage.removeItem("navigator_locate_app");
        localStorage.setItem(
            "navigator_view_app",
            JSON.stringify({ mapView: { center: { lat: 50.6539, lng: -128.0094 }, zoom: 18 } }),
        );
    });

const withGrantedStorage = (page) =>
    page.addInitScript(() => {
        localStorage.setItem(
            "navigator_locate_app",
            JSON.stringify({ permissionGranted: true }),
        );
        localStorage.setItem(
            "navigator_view_app",
            JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
        );
    });

const grantGeolocation = (page, coords = { latitude: 50.6539, longitude: -128.0094 }) =>
    page.context().grantPermissions(["geolocation"]).then(() =>
        page.context().setGeolocation(coords),
    );

test.use({ viewport: { width: 1280, height: 720 } });

// ─── Modals ──────────────────────────────────────────────────────────────────

test("confirmation modal — first-time locate", async ({ page }) => {
    await withNoLocateStorage(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page.getByText("Permission Required").waitFor({ state: "visible" });
    await page.waitForTimeout(200);

    await page.screenshot({
        path: path.join(OUT, "confirmation-modal.png"),
    });
});

test("permission denied modal — error state", async ({ page }) => {
    await withGrantedStorage(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page.getByText("Location access denied").waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(200);

    await page.screenshot({
        path: path.join(OUT, "permission-denied-modal.png"),
    });
});

// ─── Button modes (cropped around the button) ───────────────────────────────

/**
 * Capture a small region around the locate button.
 * The button sits in the top-right area of the nav bar.
 */
/** Wait for the map to finish rendering all tiles (idle state). */
const waitForMapIdle = (page) =>
    page.locator(".navigator-map[data-map-idle]").waitFor({ timeout: 15000 });

async function screenshotLocateButton(page, filename) {
    const btn = page.locator("#locate-button");
    const nav = page.locator(".navigator-top nav");
    const box = await btn.boundingBox();
    const navBox = await nav.boundingBox();
    const pad = 20;
    const clipTop = Math.max(0, box.y - pad);
    const clipBottom = Math.min(navBox.y + navBox.height, box.y + box.height + pad);
    await page.screenshot({
        path: path.join(OUT, filename),
        clip: {
            x: Math.max(0, box.x - pad),
            y: clipTop,
            width: box.width + pad * 2,
            height: clipBottom - clipTop,
        },
    });
}

test("locate button — inactive", async ({ page }) => {
    await withGrantedStorage(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await screenshotLocateButton(page, "button-inactive.png");
});

test("locate button — active", async ({ page }) => {
    await withGrantedStorage(page);
    await grantGeolocation(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page
        .locator("#locate-button")
        .filter({ hasText: /Located/ })
        .waitFor({ timeout: 5000 });
    await waitForMapIdle(page);

    await screenshotLocateButton(page, "button-active.png");
});

test("locate button — following", async ({ page }) => {
    await withGrantedStorage(page);
    await grantGeolocation(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page
        .locator("#locate-button")
        .filter({ hasText: /Located/ })
        .waitFor({ timeout: 5000 });
    await page.locator("#locate-button").click();
    await page
        .locator("#locate-button")
        .filter({ hasText: /Following/ })
        .waitFor({ timeout: 5000 });
    await waitForMapIdle(page);

    await screenshotLocateButton(page, "button-following.png");
});

test("locate button — error", async ({ page }) => {
    await withGrantedStorage(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page
        .locator("#locate-button")
        .filter({ hasText: /Error/ })
        .waitFor({ timeout: 5000 });
    // Close the error modal first
    await page.locator("#locate-error-close").click();

    await screenshotLocateButton(page, "button-error.png");
});

// ─── Map markers (cropped around the marker) ─────────────────────────────────

test("map marker — position", async ({ page }) => {
    await withGrantedStorage(page);
    await grantGeolocation(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page.locator(".navigator-locate-position").waitFor({ state: "visible", timeout: 5000 });
    await waitForMapIdle(page);

    const marker = page.locator(".navigator-locate-position");
    const box = await marker.boundingBox();
    const pad = 60;
    await page.screenshot({
        path: path.join(OUT, "marker-position.png"),
        clip: {
            x: Math.max(0, box.x - pad),
            y: Math.max(0, box.y - pad),
            width: box.width + pad * 2,
            height: box.height + pad * 2,
        },
    });
});

test("map marker — heading", async ({ page }) => {
    await withGrantedStorage(page);
    await grantGeolocation(page);
    await page.goto(`/${TEST_HASH}`);
    await page.waitForLoadState("networkidle");

    await page.locator("#locate-button").click();
    await page.locator(".navigator-locate-position").waitFor({ state: "visible", timeout: 5000 });

    // Simulate a compass heading via DeviceOrientationEvent.
    // Chromium listens on deviceorientationabsolute when available.
    await page.evaluate(() => {
        const eventName = "ondeviceorientationabsolute" in window
            ? "deviceorientationabsolute"
            : "deviceorientation";
        const event = new DeviceOrientationEvent(eventName, {
            alpha: 45,
            beta: 0,
            gamma: 0,
            absolute: true,
        });
        window.dispatchEvent(event);
    });
    await page.locator(".navigator-locate-heading").waitFor({ state: "visible", timeout: 5000 });
    await waitForMapIdle(page);

    const heading = page.locator(".navigator-locate-heading");
    const box = await heading.boundingBox();
    const pad = 60;
    await page.screenshot({
        path: path.join(OUT, "marker-heading.png"),
        clip: {
            x: Math.max(0, box.x - pad),
            y: Math.max(0, box.y - pad),
            width: box.width + pad * 2,
            height: box.height + pad * 2,
        },
    });
});

// ─── Navbar badge ────────────────────────────────────────────────────────────

test("navbar badge — location error state", async ({ page }) => {
    await withGrantedStorage(page);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Trigger the error state
    await page.locator("#locate-button").click();
    await page
        .locator("#locate-button")
        .filter({ hasText: /Error/ })
        .waitFor({ timeout: 5000 });

    // Close the error modal so the badge is unobstructed
    await page.locator("#locate-error-close").click();
    await page.locator(".navigator-alert-badge").waitFor();
    await waitForMapIdle(page);

    await page.screenshot({
        path: path.join(OUT, "navbar-badge.png"),
    });
});

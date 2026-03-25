import { test, expect } from "@playwright/test";

/**
 * Tests for docs/features/locate.md
 *
 * Covers the Locate button states, permission flow modals, and map marker.
 */

const withNoLocateStorage = (page) =>
    page.addInitScript(() => {
        localStorage.removeItem("navigator_locate_app");
        localStorage.removeItem("navigator_view_app");
    });

const withGrantedStorage = (page) =>
    page.addInitScript(() => {
        localStorage.setItem(
            "navigator_locate_app",
            JSON.stringify({ permissionGranted: true }),
        );
        // Seed view storage so the About modal doesn't appear
        localStorage.setItem(
            "navigator_view_app",
            JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
        );
    });

const grantGeolocation = (page, coords = { latitude: 51.5, longitude: -0.1 }) =>
    page.context().grantPermissions(["geolocation"]).then(() =>
        page.context().setGeolocation(coords),
    );

/** Dismiss the About modal if it appears (first-load state). */
const dismissAboutModal = async (page) => {
    const modal = page.locator("#about-modal");
    if (await modal.isVisible().catch(() => false)) {
        await page.locator("#about-modal-close").click();
        await modal.waitFor({ state: "hidden" });
    }
};

// ─── Locate / Button ──────────────────────────────────────────────────────────

test.describe("Locate / Button", () => {
    test.beforeEach(async ({ page }) => {
        await withNoLocateStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await dismissAboutModal(page);
    });

    test("locate button is visible in the top navigation bar", async ({ page }) => {
        await expect(page.locator("#locate-button")).toBeVisible();
    });

    test("locate button shows Locate label when inactive", async ({ page }) => {
        await expect(page.locator("#locate-button")).toContainText("Locate");
    });

    test("locate button is not in pressed state when inactive", async ({ page }) => {
        const btn = page.locator("#locate-button");
        await expect(btn).toHaveAttribute("aria-pressed", "false");
    });
});

// ─── Locate / Confirmation modal ─────────────────────────────────────────────

test.describe("Locate / Confirmation modal", () => {
    test.beforeEach(async ({ page }) => {
        await withNoLocateStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await dismissAboutModal(page);
    });

    test("confirmation modal appears on first click with no stored permission", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await expect(
            page.getByText("Permission Required"),
        ).toBeVisible();
    });

    test("confirmation modal body explains the permission request", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await expect(
            page.getByText(/To display your current location and compass heading/),
        ).toBeVisible();
    });

    test("cancelling the confirmation modal keeps the button inactive", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await page.getByText("Cancel").click();
        await expect(page.getByText("Permission Required")).toBeHidden();
        await expect(page.locator("#locate-button")).toContainText("Locate");
    });

    test("confirmation modal is not shown when permission was previously granted", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await grantGeolocation(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();
        await expect(page.getByText("Permission Required")).toBeHidden();
    });
});

// ─── Locate / Active and Following states ────────────────────────────────────

test.describe("Locate / Active and Following states", () => {
    test.beforeEach(async ({ page }) => {
        await withGrantedStorage(page);
        await grantGeolocation(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");
    });

    test("button shows Located label after location is acquired", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Located/);
    });

    test("button advances to Following on second click", async ({ page }) => {
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Located/);

        await page.locator("#locate-button").click();
        await expect(page.locator("#locate-button")).toContainText("Following");
    });

    test("button returns to Locate on third click", async ({ page }) => {
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Located/);

        await page.locator("#locate-button").click();
        await page.locator("#locate-button").click();
        await expect(page.locator("#locate-button")).toContainText("Locate");
    });

    test("position marker appears on the map when active", async ({ page }) => {
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator(".navigator-locate-position").count(), {
                timeout: 5000,
            })
            .toBeGreaterThan(0);
    });

    test("position marker is removed when locate is stopped", async ({ page }) => {
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator(".navigator-locate-position").count(), {
                timeout: 5000,
            })
            .toBeGreaterThan(0);

        // Third click stops locate
        await page.locator("#locate-button").click();
        await page.locator("#locate-button").click();
        await expect(page.locator(".navigator-locate-position")).toHaveCount(0);
    });
});

// ─── Locate / Error state ─────────────────────────────────────────────────────

test.describe("Locate / Error state", () => {
    test("error modal appears when geolocation permission is denied", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        // Do NOT grant geolocation — denial triggers the error callback
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Error/);

        await expect(page.getByText("Location access denied")).toBeVisible({
            timeout: 5000,
        });
    });

    test("error modal shows re-enable instructions", async ({ page }) => {
        await withGrantedStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.getByText("Location access denied").isVisible(), {
                timeout: 5000,
            })
            .toBe(true);

        await expect(page.getByText(/Chrome \/ Edge/)).toBeVisible();
    });

    test("closing the error modal does not clear the error state", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.getByText("Location access denied").isVisible(), {
                timeout: 5000,
            })
            .toBe(true);

        await page.locator("#locate-error-close").click();
        await expect(page.getByText("Location access denied")).toBeHidden();
        await expect(page.locator("#locate-button")).toContainText("Error");
    });

    test("clicking the Error button re-opens the error modal", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.locator("#locate-error-close").isVisible(), {
                timeout: 5000,
            })
            .toBe(true);

        await page.locator("#locate-error-close").click();
        await expect(page.getByText("Location access denied")).toBeHidden();

        await page.locator("#locate-button").click();
        await expect(page.getByText("Location access denied")).toBeVisible();
    });
});

// ─── Locate / Heading marker ──────────────────────────────────────────────────

test.describe("Locate / Heading marker", () => {
    test("compass heading uses webkitCompassHeading when available (iOS)", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await grantGeolocation(page);

        // Simulate iOS: remove deviceorientationabsolute so code falls back to
        // deviceorientation, then provide webkitCompassHeading on the event.
        await page.addInitScript(() => {
            delete window.ondeviceorientationabsolute;
        });

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Start locate tracking
        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator(".navigator-locate-position").count(), {
                timeout: 5000,
            })
            .toBeGreaterThan(0);

        // Dispatch a deviceorientation event with webkitCompassHeading = 180.
        // The relative alpha is 0, which would incorrectly produce 0° bearing
        // if the code ignores webkitCompassHeading.
        await page.evaluate(() => {
            const event = new DeviceOrientationEvent("deviceorientation", {
                alpha: 0,
                beta: 0,
                gamma: 0,
            });
            Object.defineProperty(event, "webkitCompassHeading", {
                value: 180,
                writable: false,
            });
            window.dispatchEvent(event);
        });

        // The heading marker should appear and be rotated to ~180°, not 0°.
        const headingEl = page.locator(".navigator-locate-heading");
        await expect
            .poll(() => headingEl.count(), { timeout: 3000 })
            .toBeGreaterThan(0);

        const rotation = await headingEl.evaluate((el) => {
            const transform = el.style.transform || "";
            const match = transform.match(/rotateZ\(([^)]+)deg\)/);
            return match ? parseFloat(match[1]) : null;
        });

        // Should be 180°, not 0°. Allow some tolerance for smoothing.
        expect(rotation).not.toBeNull();
        expect(rotation).toBeGreaterThan(90);
        expect(rotation).toBeLessThan(270);
    });

    test("compass heading falls back to alpha for absolute events", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await grantGeolocation(page);

        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();
        await expect
            .poll(() => page.locator(".navigator-locate-position").count(), {
                timeout: 5000,
            })
            .toBeGreaterThan(0);

        // Dispatch an absolute orientation event (no webkitCompassHeading)
        // alpha=90, absolute=true → bearing should be (360-90)=270°
        await page.evaluate(() => {
            const event = new DeviceOrientationEvent(
                "deviceorientationabsolute",
                { alpha: 90, beta: 0, gamma: 0, absolute: true },
            );
            window.dispatchEvent(event);
        });

        const headingEl = page.locator(".navigator-locate-heading");
        await expect
            .poll(() => headingEl.count(), { timeout: 3000 })
            .toBeGreaterThan(0);

        const rotation = await headingEl.evaluate((el) => {
            const transform = el.style.transform || "";
            const match = transform.match(/rotateZ\(([^)]+)deg\)/);
            return match ? parseFloat(match[1]) : null;
        });

        // (360 - 90) % 360 = 270°
        expect(rotation).not.toBeNull();
        expect(rotation).toBeGreaterThan(180);
        expect(rotation).toBeLessThan(360);
    });
});

// ─── Locate / Menu alerts and navbar badge ────────────────────────────────────

test.describe("Locate / Menu alerts and navbar badge", () => {
    test("navbar alert badge is not visible when locate is inactive", async ({
        page,
    }) => {
        await withNoLocateStorage(page);
        await page.goto("/");
        await page.waitForSelector(".navigator-map canvas");

        await expect(page.locator(".navigator-alert-badge")).toBeHidden();
    });

    test("navbar alert badge appears when location access is denied", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        // No geolocation permission — clicking locate will trigger onError
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Error/);

        // Close the error modal so the badge is visible
        await page.locator("#locate-error-close").click();

        await expect(page.locator(".navigator-alert-badge")).toBeVisible();
    });

    test("position lost alert appears in menu when location access is denied", async ({
        page,
    }) => {
        await withGrantedStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        await page.locator("#locate-button").click();

        await expect
            .poll(() => page.locator("#locate-button").textContent(), {
                timeout: 5000,
            })
            .toMatch(/Error/);

        await page.locator("#locate-error-close").click();

        // Open menu panel and check for alert
        const offcanvas = page.locator(".offcanvas.show");
        if (!(await offcanvas.isVisible())) {
            await page.click(".navbar-toggler");
            await offcanvas.waitFor();
        }

        await expect(page.locator("#menu-position-lost-alert")).toBeVisible();
        await expect(
            page.locator("#menu-position-lost-alert"),
        ).toContainText("Location access lost");
    });
});

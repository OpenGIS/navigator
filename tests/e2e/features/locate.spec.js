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
    });

const grantGeolocation = (page, coords = { latitude: 51.5, longitude: -0.1 }) =>
    page.context().grantPermissions(["geolocation"]).then(() =>
        page.context().setGeolocation(coords),
    );

// ─── Locate / Button ──────────────────────────────────────────────────────────

test.describe("Locate / Button", () => {
    test.beforeEach(async ({ page }) => {
        await withNoLocateStorage(page);
        await page.goto("/");
        await page.waitForLoadState("networkidle");
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
    });

    test("confirmation modal appears on first click with no stored permission", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await expect(
            page.getByText("Allow location access?"),
        ).toBeVisible();
    });

    test("confirmation modal body explains the permission request", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await expect(
            page.getByText(/Navigator will ask your browser for permission/),
        ).toBeVisible();
    });

    test("cancelling the confirmation modal keeps the button inactive", async ({
        page,
    }) => {
        await page.locator("#locate-button").click();
        await page.getByText("Cancel").click();
        await expect(page.getByText("Allow location access?")).toBeHidden();
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
        await expect(page.getByText("Allow location access?")).toBeHidden();
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

import { test } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/features/locate.md
 *
 * Captures the navbar alert badge visible when location access is denied.
 * Output: assets/screenshots/docs/features/locate/
 */

const OUT = path.resolve("assets/screenshots/docs/features/locate");

const withGrantedStorage = (page) =>
    page.addInitScript(() => {
        localStorage.setItem(
            "navigator_locate_app",
            JSON.stringify({ permissionGranted: true }),
        );
    });

test.use({ viewport: { width: 1280, height: 720 } });

test("navbar badge — location error state", async ({ page }) => {
    await withGrantedStorage(page);
    // No geolocation permission — clicking locate will produce an error state
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

    await page.screenshot({
        path: path.join(OUT, "navbar-badge.png"),
    });
});

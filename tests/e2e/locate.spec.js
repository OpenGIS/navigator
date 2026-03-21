import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Locate Functionality", () => {
  test.beforeEach(async ({ context, page }) => {
    // Grant geolocation permissions
    await context.grantPermissions(["geolocation"]);
    // Set a fixed location (e.g., London Eye)
    await context.setGeolocation({ latitude: 51.5033, longitude: -0.1195 });

    await page.goto("/");

    // Wait for map to load
    await expect(page.locator("#waymark canvas")).toBeVisible();
  });

  test("Locate button toggles position and heading", async ({ page }) => {
    const getUseHref = async (locator) =>
      (await locator.getAttribute("xlink:href")) ||
      (await locator.getAttribute("href"));

    // 1. Locate button exists
    // The button has an svg use href containing 'position'
    // We can also target by class .navbar-nav-link-icon
    const locateBtn = page.locator("#locate-button");
    await expect(locateBtn).toBeVisible();

    // 2. Click to "Show" mode
    await locateBtn.click();

    // 3. Verify marker appears on map
    // The marker is added to the map. It usually has class 'maplibregl-marker' or similar from Waymark/MapLibre.
    // The icon HTML inside has class 'oi'.
    // We wait for the marker to be present in the DOM
    const marker = page.locator(".maplibregl-marker .oi");
    await expect(marker).toBeVisible({ timeout: 10000 });

    // 4. Verify the icon is the standard position icon (no heading)
    // This part reproduces the bug: checks for valid href/xlink:href
    // If the bug exists (using :xlink:href), this locator might fail or the attribute check will fail
    const useElement = marker.locator("use");

    // Check if use element has valid href
    // We check specifically that it does NOT use the buggy :xlink:href syntax in the DOM
    // In a real browser, :xlink:href attribute might be present if the HTML parser didn't strip it,
    // but the xlink:href/href won't be valid.

    // We assert that the href attribute contains the correct icon ID
    const href = await getUseHref(useElement);
    expect(href).toMatch(/#position$/);

    // Take screenshot for location only
    await page.screenshot({
      path: path.resolve(
        process.cwd(),
        "assets/screenshots/locate-position.png",
      ),
      fullPage: true,
    });

    // 5. Simulate compass heading in a retry loop to ensure listener is active
    await expect(async () => {
      // Dispatch event
      await page.evaluate(() => {
        // Check which event type the app is listening to
        const eventType =
          "ondeviceorientationabsolute" in window
            ? "deviceorientationabsolute"
            : "deviceorientation";

        const event = new Event(eventType, { bubbles: true });

        // Define properties
        Object.defineProperty(event, "alpha", { value: 270 });
        Object.defineProperty(event, "absolute", { value: true });

        window.dispatchEvent(event);
      });

      const href = await getUseHref(useElement);
      expect(href).toMatch(/#position-heading$/);
    }).toPass({ timeout: 15000, interval: 1000 });

    // Take screenshot for heading in Show mode
    await page.screenshot({
      path: path.resolve(
        process.cwd(),
        "assets/screenshots/locate-heading.png",
      ),
      fullPage: true,
    });

    // 6. Switch to "Follow" mode
    await locateBtn.click();

    // Verify button icon changes to 'position-lock'
    // The button svg use href should contain 'position-lock'
    // Wait for the update
    await expect
      .poll(async () => getUseHref(locateBtn.locator("use")))
      .toMatch(/#position-lock$/);

    // Take screenshot for Follow mode
    await page.screenshot({
      path: path.resolve(process.cwd(), "assets/screenshots/locate-follow.png"),
      fullPage: true,
    });

    // 7. Switch off
    await locateBtn.click();

    // Verify marker is removed from map
    // The marker element should be detached or hidden
    await expect(marker).toBeHidden();
  });
});

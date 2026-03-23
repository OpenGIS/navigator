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
    // 1. Locate button exists
    const locateBtn = page.locator("#locate-button");
    await expect(locateBtn).toBeVisible();

    // 2. Click to "Show" mode
    await locateBtn.click();

    // 3. Verify position appears — the #waymark container reflects mode via data attribute
    const waymarkEl = page.locator("#waymark");
    await expect(waymarkEl).toHaveAttribute("data-position-mode", "show", {
      timeout: 10000,
    });

    // 4. Verify no heading yet (plain position icon)
    await expect(waymarkEl).toHaveAttribute("data-position-heading", "false");

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

      await expect(waymarkEl).toHaveAttribute("data-position-heading", "true");
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
    await expect
      .poll(async () => {
        const use = locateBtn.locator("use");
        return (
          (await use.getAttribute("xlink:href")) ||
          (await use.getAttribute("href"))
        );
      })
      .toMatch(/#position-lock$/);

    // Take screenshot for Follow mode
    await page.screenshot({
      path: path.resolve(process.cwd(), "assets/screenshots/locate-follow.png"),
      fullPage: true,
    });

    // 7. Switch off
    await locateBtn.click();

    // Verify position is removed — data-position-mode clears
    await expect(waymarkEl).toHaveAttribute("data-position-mode", "");
  });
});

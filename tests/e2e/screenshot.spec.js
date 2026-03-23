import { test, expect } from "@playwright/test";
import path from "path";

const targetLocation = {
  latitude: 50.6539,
  longitude: -128.0094,
};

const targetZoom = 16;

test("take homepage screenshot", async ({ context, page }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation(targetLocation);

  await page.addInitScript(
    ({ latitude, longitude, zoom }) => {
      localStorage.clear();

      localStorage.setItem(
        "navigator_view",
        JSON.stringify({
          mapView: {
            center: [longitude, latitude],
            zoom,
          },
        }),
      );

      // Keep history non-empty so first locate click does not force zoom=14.
      localStorage.setItem(
        "navigator_position",
        JSON.stringify({
          positionMode: null,
          currentPosition: null,
          positionHistory: [{ id: "seed-position-history" }],
        }),
      );
    },
    {
      ...targetLocation,
      zoom: targetZoom,
    },
  );

  await page.goto("/");
  await expect(page.locator("#waymark canvas")).toBeVisible();

  const locateBtn = page.locator("#locate-button");
  const panel = page.locator("#side-panel");

  // show mode
  await locateBtn.click();
  await expect(page.locator("#waymark")).toHaveAttribute(
    "data-position-mode",
    "show",
    { timeout: 10000 },
  );

  // follow mode
  await locateBtn.click();
  await expect.poll(async () => {
    const use = locateBtn.locator("use");
    return (
      (await use.getAttribute("xlink:href")) || (await use.getAttribute("href"))
    );
  }).toMatch(/position-lock/);

  await expect.poll(async () => {
    return page.evaluate(() => {
      const saved = localStorage.getItem("navigator_view");
      if (!saved) return null;
      const mapView = JSON.parse(saved).mapView;
      return typeof mapView?.zoom === "number" ? mapView.zoom : null;
    });
  }).toBeCloseTo(targetZoom, 0);

  // NW heading (315°): heading = 360 - alpha, so alpha = 45.
  await expect(async () => {
    await page.evaluate(() => {
      const eventType =
        "ondeviceorientationabsolute" in window
          ? "deviceorientationabsolute"
          : "deviceorientation";

      const event = new Event(eventType, { bubbles: true });
      Object.defineProperty(event, "alpha", { value: 45 });
      Object.defineProperty(event, "absolute", { value: true });

      window.dispatchEvent(event);
    });

    await expect(page.locator("#waymark")).toHaveAttribute(
      "data-position-heading",
      "true",
    );
  }).toPass({ timeout: 15000, interval: 1000 });

  // Panel is open by default on desktop — wait for the slide-in transition
  await expect(panel).toBeVisible({ timeout: 5000 });
  await expect(panel).toHaveClass(/show/);
  await expect(panel).toHaveCSS("transform", "none");
  await expect(page.getByText("Current Location")).toBeVisible();
  await expect(panel.getByText("50.653900")).toBeVisible();
  await expect(panel.getByText("-128.009400")).toBeVisible();
  await expect(panel.getByText("NW")).toBeVisible();
  await expect(panel.getByText("315°")).toBeVisible();

  const screenshotPath = path.resolve(
    process.cwd(),
    "assets/screenshots/app-preview.png",
  );

  await page.screenshot({ path: screenshotPath, fullPage: true });
});

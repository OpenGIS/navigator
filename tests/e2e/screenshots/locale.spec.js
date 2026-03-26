import { test, expect } from "@playwright/test";
import path from "path";

/**
 * Screenshots for docs/locale.md
 *
 * Captures the About modal rendered in French and the Settings panel
 * with the French language preference selected.
 * Output: assets/screenshots/docs/locale/
 */

const OUT = path.resolve("assets/screenshots/docs/locale");

const TEST_HASH = "#map=12/50.653900/-128.009400";

// Desktop viewport
test.use({ viewport: { width: 1280, height: 720 } });

// ─── About modal in French ────────────────────────────────────────────────────

test("About modal — French locale", async ({ page }) => {
  // Clear view storage so the About modal appears on first visit
  await page.addInitScript(() => {
    localStorage.removeItem("navigator_view_app");
    localStorage.removeItem("navigator_settings_app");
  });

  // ?locale=fr tells index.html to init with locale: 'fr'
  await page.goto(`/?locale=fr${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  await page.locator("#about-modal").waitFor({ state: "visible" });
  // Allow modal animation to settle
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/about-french.png` });
});

// ─── Settings panel — French language selected ────────────────────────────────

test("Settings panel — language preference set to French", async ({ page }) => {
  // Seed French language preference so Settings renders in French
  await page.addInitScript(() => {
    localStorage.setItem(
      "navigator_settings_app",
      JSON.stringify({ theme: null, units: "metric", language: "fr" }),
    );
    localStorage.setItem(
      "navigator_view_app",
      JSON.stringify({ mapView: { center: { lat: 50.6539, lng: -128.0094 }, zoom: 12 } }),
    );
  });

  await page.goto(`/${TEST_HASH}`);
  await page.waitForLoadState("networkidle");

  // Ensure the offcanvas panel is open (auto-opens on desktop)
  const offcanvas = page.locator(".offcanvas.show");
  if (!(await offcanvas.isVisible())) {
    await page.click(".navbar-toggler");
    await offcanvas.waitFor();
  }

  // Open Settings — label is in French because stored language is 'fr'
  await page.getByRole("button", { name: /paramètres/i }).click();

  // Wait for the settings language select to be visible with 'fr' selected
  await expect(page.locator("#settings-language")).toHaveValue("fr");

  // Allow panel transition to settle
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${OUT}/settings-language-french.png` });
});

// ─── Paris in French ─────────────────────────────────────────────────────────

test("OSM multilingual names — Paris with French labels", async ({ page }) => {
  // Seed view and clear any stored language preference so the locale option drives the language
  await page.addInitScript(() => {
    localStorage.setItem(
      "navigator_view_app",
      JSON.stringify({ mapView: { center: { lat: 48.8566, lng: 2.3522 }, zoom: 12 } }),
    );
    localStorage.removeItem("navigator_settings_app");
  });

  // ?locale=fr sets French as the default; the hash centres on Paris
  await page.goto("/?locale=fr#map=12/48.856600/2.352200");
  await page.waitForLoadState("networkidle");

  // Confirm map is rendered
  await expect(page.locator(".navigator-map canvas")).toBeVisible();

  // Allow tile rendering to settle
  await page.waitForTimeout(600);

  await page.screenshot({ path: `${OUT}/paris-french-labels.png` });
});

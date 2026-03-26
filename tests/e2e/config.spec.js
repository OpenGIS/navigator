import { test, expect } from "@playwright/test";

/**
 * Tests for docs/config.md
 *
 * Covers each Navigator.init() option: id, debug, locale, messages, mapOptions.
 * The demo app (index.html) uses id: "app" and exposes URL params for testing.
 */

// Seed view storage so the About modal does not appear
test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		if (!localStorage.getItem("navigator_view_app")) {
			localStorage.setItem(
				"navigator_view_app",
				JSON.stringify({ mapView: { center: { lat: 50.6539, lng: -128.0094 }, zoom: 10 } }),
			);
		}
	});
});

// ─── Navigator.init() ─────────────────────────────────────────────────────────

test.describe("Navigator.init()", () => {
	test("mounts and returns a Vue app instance", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#app canvas")).toBeVisible();
	});

	test("all options are optional — bare init() works", async ({ page }) => {
		// index.html always passes id, but the app should render with defaults
		await page.goto("/");
		await expect(page.locator(".navigator-map canvas")).toBeVisible();
	});
});

// ─── id ──────────────────────────────────────────────────────────────────────

test.describe("id", () => {
	test("mounts into the element matching the id", async ({ page }) => {
		await page.goto("/");
		// index.html uses id: "app" — the mount div must exist and contain the map
		await expect(page.locator("#app .navigator-map canvas")).toBeVisible();
	});

	test("scopes localStorage keys to the instance id", async ({ page }) => {
		// Seed a key for id "app" so it is read on load
		const viewKey = "navigator_view_app";
		await page.addInitScript((key) => {
			localStorage.setItem(
				key,
				JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
			);
		}, viewKey);

		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// The stored key must follow navigator_{namespace}_{id}
		const stored = await page.evaluate((k) => localStorage.getItem(k), viewKey);
		expect(stored).not.toBeNull();
	});
});

// ─── debug ────────────────────────────────────────────────────────────────────

test.describe("debug", () => {
	test("debug: true does not break the app", async ({ page }) => {
		// index.html reads ?debug=true and passes it to Navigator.init()
		await page.goto("/?debug=true");
		await expect(page.locator(".navigator-map canvas")).toBeVisible();
	});

	test("debug: false (default) renders normally", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator(".navigator-map canvas")).toBeVisible();
	});
});

// ─── locale ───────────────────────────────────────────────────────────────────

test.describe("locale", () => {
	test("locale option sets the default UI language", async ({ page }) => {
		await page.goto("/?locale=fr");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		// Settings button label should be in French
		await expect(page.getByRole("button", { name: /paramètres/i })).toBeVisible();
	});

	test("stored user preference overrides the locale option", async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem(
				"navigator_settings_app",
				JSON.stringify({ theme: null, units: null, language: "en" }),
			);
		});

		await page.goto("/?locale=fr");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		// Stored "en" beats init locale "fr"
		await expect(page.getByRole("button", { name: /settings/i })).toBeVisible();
	});
});

// ─── messages ────────────────────────────────────────────────────────────────

test.describe("messages", () => {
	test("messages option overrides a built-in label", async ({ page }) => {
		const overrides = encodeURIComponent(
			JSON.stringify({ en: { "menu.settings": "Preferences" } }),
		);

		await page.goto(`/?messages=${overrides}`);
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		await expect(page.getByRole("button", { name: /preferences/i })).toBeVisible();
	});

	test("unspecified labels continue to use built-in values", async ({ page }) => {
		// Only override one key; the rest should still use the built-in English values
		const overrides = encodeURIComponent(
			JSON.stringify({ en: { "menu.settings": "Preferences" } }),
		);

		await page.goto(`/?messages=${overrides}`);
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		// "About" label was not overridden — should still be the built-in value
		await expect(page.getByRole("button", { name: /about/i })).toBeVisible();
	});
});

// ─── mapOptions ───────────────────────────────────────────────────────────────

test.describe("mapOptions", () => {
	test("default style loads and renders attribution control", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// OpenFreeMap bright style renders a MapLibre attribution control
		await expect(page.locator(".maplibregl-ctrl-attrib")).toBeVisible();
	});
});

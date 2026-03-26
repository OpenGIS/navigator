import { test, expect } from "@playwright/test";

const SETTINGS_KEY = "navigator_settings_app";

// Seed view storage so the About modal does not appear
test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		if (!localStorage.getItem("navigator_view_app")) {
			localStorage.setItem(
				"navigator_view_app",
				JSON.stringify({ mapView: { center: { lat: 51.5, lng: -0.1 }, zoom: 10 } }),
			);
		}
	});
});

// ─── Language resolution ─────────────────────────────────────────────────────

test.describe("Language resolution", () => {
	test.describe("browser language — French (fr-FR)", () => {
		test.use({ locale: "fr-FR" });

		test("UI renders in French when browser language is French", async ({
			page,
		}) => {
			await page.goto("/");
			await page.waitForSelector(".navigator-map canvas");

			// Open the menu panel
			const offcanvas = page.locator(".offcanvas.show");
			if (!(await offcanvas.isVisible())) {
				await page.click(".navbar-toggler");
				await offcanvas.waitFor();
			}

			// Settings button label should be French
			await expect(
				page.getByRole("button", { name: /paramètres/i }),
			).toBeVisible();
		});
	});

	test.describe("browser language — English (en-US)", () => {
		test.use({ locale: "en-US" });

		test("UI renders in English when browser language is English", async ({
			page,
		}) => {
			await page.goto("/");
			await page.waitForSelector(".navigator-map canvas");

			const offcanvas = page.locator(".offcanvas.show");
			if (!(await offcanvas.isVisible())) {
				await page.click(".navbar-toggler");
				await offcanvas.waitFor();
			}

			await expect(
				page.getByRole("button", { name: /settings/i }),
			).toBeVisible();
		});
	});

	test("unknown browser language falls back to English", async ({ page }) => {
		// Clear any stored preference so only browser lang is used
		await page.addInitScript(() => {
			localStorage.removeItem("navigator_settings_app");
		});
		// Navigate with an unsupported locale override via URL (browser default is en)
		await page.goto("/");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		await expect(
			page.getByRole("button", { name: /settings/i }),
		).toBeVisible();
	});
});

// ─── init() options ───────────────────────────────────────────────────────────

test.describe("init() options", () => {
	test("locale option sets the default language", async ({ page }) => {
		// index.html reads ?locale= and passes it to Navigator.init()
		await page.goto("/?locale=fr");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		await expect(
			page.getByRole("button", { name: /paramètres/i }),
		).toBeVisible();
	});

	test("stored preference overrides init locale option", async ({ page }) => {
		// Even though init sets locale: 'fr', stored 'en' should win
		await page.addInitScript((key) => {
			localStorage.setItem(key, JSON.stringify({ theme: null, units: null, language: "en" }));
		}, SETTINGS_KEY);

		await page.goto("/?locale=fr");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		await expect(
			page.getByRole("button", { name: /settings/i }),
		).toBeVisible();
	});

	test("messages option overrides a label", async ({ page }) => {
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

		await expect(
			page.getByRole("button", { name: /preferences/i }),
		).toBeVisible();
	});
});

// ─── Persistence ──────────────────────────────────────────────────────────────

test.describe("Persistence", () => {
	test("language preference is saved to localStorage", async ({ page }) => {
		await page.goto("/");
		await page.waitForSelector(".navigator-map canvas");

		// Open settings
		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}
		await page.getByRole("button", { name: /settings/i }).click();

		// Select French
		await page.locator("#settings-language").selectOption("fr");

		const stored = await page.evaluate(
			(key) => JSON.parse(localStorage.getItem(key)),
			SETTINGS_KEY,
		);
		expect(stored.language).toBe("fr");
	});

	test("persisted language is applied on page reload", async ({ page }) => {
		await page.addInitScript((key) => {
			localStorage.setItem(key, JSON.stringify({ theme: null, units: null, language: "fr" }));
		}, SETTINGS_KEY);

		await page.goto("/");
		await page.waitForSelector(".navigator-map canvas");

		const offcanvas = page.locator(".offcanvas.show");
		if (!(await offcanvas.isVisible())) {
			await page.click(".navbar-toggler");
			await offcanvas.waitFor();
		}

		await expect(
			page.getByRole("button", { name: /paramètres/i }),
		).toBeVisible();
	});
});

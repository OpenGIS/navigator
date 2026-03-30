import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApp = {
	provide: vi.fn(),
	mount: vi.fn(),
	unmount: vi.fn(),
};

vi.mock("vue", async (importOriginal) => {
	const actual = await importOriginal();
	return { ...actual, createApp: vi.fn(() => mockApp) };
});

vi.mock("@/App.vue", () => ({ default: { name: "App" } }));
vi.mock("@/assets/sass/theme.scss", () => ({}));
vi.mock("bootstrap", () => ({}));
vi.mock("maplibre-gl", () => ({ default: {} }));
vi.mock("@/composables/useMap.js", () => ({ getMapInstance: vi.fn() }));

import Navigator from "@/index.js";
import { createApp } from "vue";

beforeEach(() => {
	vi.clearAllMocks();
	document.body.innerHTML = "";
});

describe("Navigator.create()", () => {
	it("returns a NavigatorInstance with app, id, mount, unmount, on, off, emit", () => {
		const nav = Navigator.create();
		expect(nav).toHaveProperty("app");
		expect(nav).toHaveProperty("id");
		expect(nav).toHaveProperty("mount");
		expect(nav).toHaveProperty("unmount");
		expect(nav).toHaveProperty("on");
		expect(nav).toHaveProperty("off");
		expect(nav).toHaveProperty("emit");
	});

	it("all options are optional — bare create() works", () => {
		expect(() => Navigator.create()).not.toThrow();
	});

	it("creates a <div> when no matching element exists", () => {
		Navigator.create({ id: "new-map" });
		const el = document.getElementById("new-map");
		expect(el).not.toBeNull();
		expect(el.tagName).toBe("DIV");
		expect(document.body.contains(el)).toBe(true);
	});

	it("uses an existing <div> if one matches the id", () => {
		const existing = document.createElement("div");
		existing.id = "existing-map";
		document.body.appendChild(existing);

		const nav = Navigator.create({ id: "existing-map" });
		nav.mount();

		const els = document.querySelectorAll("#existing-map");
		expect(els.length).toBe(1);
		expect(mockApp.mount).toHaveBeenCalledWith(existing);
	});

	it("defaults id to 'navigator'", () => {
		const nav = Navigator.create();
		expect(nav.id).toBe("navigator");
	});

	it("provides navigatorId matching the id option", () => {
		Navigator.create({ id: "my-map" });
		expect(mockApp.provide).toHaveBeenCalledWith("navigatorId", "my-map");
	});

	it("provides navigatorLocale from the locale option", () => {
		Navigator.create({ id: "t1", locale: "fr" });
		expect(mockApp.provide).toHaveBeenCalledWith("navigatorLocale", "fr");
	});

	it("provides navigatorLocale as null by default", () => {
		Navigator.create({ id: "t2" });
		expect(mockApp.provide).toHaveBeenCalledWith("navigatorLocale", null);
	});

	it("provides navigatorMessages from the messages option", () => {
		const msgs = { en: { "about.title": "Hi" } };
		Navigator.create({ id: "t3", messages: msgs });
		expect(mockApp.provide).toHaveBeenCalledWith("navigatorMessages", msgs);
	});

	it("provides empty messages object by default", () => {
		Navigator.create({ id: "t4" });
		expect(mockApp.provide).toHaveBeenCalledWith("navigatorMessages", {});
	});

	it("passes debug and mapOptions as props to App", () => {
		Navigator.create({ id: "t5", debug: true, mapOptions: { zoom: 5 } });
		expect(createApp).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ debug: true, mapOptions: { zoom: 5 } }),
		);
	});

	it("defaults debug to false and mapOptions to {}", () => {
		Navigator.create({ id: "t6" });
		expect(createApp).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ debug: false, mapOptions: {} }),
		);
	});

	it("provides navigatorButtons as a shallowRef from the buttons option", () => {
		const buttons = [{ id: "b1", icon: "star", label: "Star" }];
		Navigator.create({ id: "t7", buttons });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorButtons");
		expect(call).toBeTruthy();
		expect(call[1].value).toEqual(buttons);
	});

	it("provides empty buttons shallowRef by default", () => {
		Navigator.create({ id: "t8" });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorButtons");
		expect(call).toBeTruthy();
		expect(call[1].value).toEqual([]);
	});

	it("provides navigatorPanels as a shallowRef from the panels option", () => {
		const panels = [{ id: "info", icon: "info-circle", title: "Info", render: vi.fn() }];
		Navigator.create({ id: "t9", panels });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorPanels");
		expect(call).toBeTruthy();
		expect(call[1].value).toEqual(panels);
	});

	it("provides empty panels shallowRef by default", () => {
		Navigator.create({ id: "t10" });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorPanels");
		expect(call).toBeTruthy();
		expect(call[1].value).toEqual([]);
	});
});

describe("NavigatorInstance.mount()", () => {
	it("mounts the Vue app to the DOM element", () => {
		const nav = Navigator.create({ id: "mount-test" });
		nav.mount();
		expect(mockApp.mount).toHaveBeenCalledWith(
			document.getElementById("mount-test"),
		);
	});

	it("does not mount twice on repeated calls", () => {
		const nav = Navigator.create({ id: "double-mount" });
		nav.mount();
		nav.mount();
		expect(mockApp.mount).toHaveBeenCalledTimes(1);
	});

	it("returns the instance for chaining", () => {
		const nav = Navigator.create({ id: "chain-mount" });
		expect(nav.mount()).toBe(nav);
	});
});

describe("NavigatorInstance.unmount()", () => {
	it("unmounts the Vue app", () => {
		const nav = Navigator.create({ id: "unmount-test" });
		nav.mount();
		nav.unmount();
		expect(mockApp.unmount).toHaveBeenCalled();
	});

	it("is safe to call without mounting first", () => {
		const nav = Navigator.create({ id: "no-mount" });
		expect(() => nav.unmount()).not.toThrow();
		expect(mockApp.unmount).not.toHaveBeenCalled();
	});
});

describe("NavigatorInstance events", () => {
	it("on/emit deliver events to listeners", () => {
		const nav = Navigator.create({ id: "evt-test" });
		const fn = vi.fn();
		nav.on("custom", fn);
		nav.emit("custom", { data: 1 });
		expect(fn).toHaveBeenCalledWith({ data: 1 });
	});

	it("off removes a listener", () => {
		const nav = Navigator.create({ id: "evt-off" });
		const fn = vi.fn();
		nav.on("custom", fn);
		nav.off("custom", fn);
		nav.emit("custom");
		expect(fn).not.toHaveBeenCalled();
	});

	it("once fires only once", () => {
		const nav = Navigator.create({ id: "evt-once" });
		const fn = vi.fn();
		nav.once("custom", fn);
		nav.emit("custom");
		nav.emit("custom");
		expect(fn).toHaveBeenCalledOnce();
	});
});

describe("Lifecycle callbacks", () => {
	it("onMapReady is registered as a map:ready listener", () => {
		const fn = vi.fn();
		const nav = Navigator.create({ id: "lc1", onMapReady: fn });
		nav.emit("map:ready", { map: {} });
		expect(fn).toHaveBeenCalledWith({ map: {} });
	});

	it("onViewChange is registered as a view:change listener", () => {
		const fn = vi.fn();
		const nav = Navigator.create({ id: "lc2", onViewChange: fn });
		nav.emit("view:change", { center: [0, 0], zoom: 5 });
		expect(fn).toHaveBeenCalledWith({ center: [0, 0], zoom: 5 });
	});

	it("onThemeChange is registered as a theme:change listener", () => {
		const fn = vi.fn();
		const nav = Navigator.create({ id: "lc3", onThemeChange: fn });
		nav.emit("theme:change", "dark");
		expect(fn).toHaveBeenCalledWith("dark");
	});

	it("onPanelChange is registered as a panel:change listener", () => {
		const fn = vi.fn();
		const nav = Navigator.create({ id: "lc4", onPanelChange: fn });
		nav.emit("panel:change", "settings");
		expect(fn).toHaveBeenCalledWith("settings");
	});

	it("ignores non-function callbacks", () => {
		expect(() =>
			Navigator.create({
				id: "lc5",
				onMapReady: "not a function",
				onViewChange: null,
			}),
		).not.toThrow();
	});
});

describe("Plugin system", () => {
	it("Navigator.use() registers a global plugin", () => {
		const install = vi.fn();
		Navigator.use({ install }, { key: "val" });

		const nav = Navigator.create({ id: "plugin-global" });
		expect(install).toHaveBeenCalledWith(
			expect.objectContaining({
				app: mockApp,
				instanceId: "plugin-global",
			}),
			{ key: "val" },
		);
	});

	it("per-instance plugins in config are installed", () => {
		const install = vi.fn();
		Navigator.create({ id: "plugin-instance", plugins: [{ install }] });
		expect(install).toHaveBeenCalledWith(
			expect.objectContaining({
				app: mockApp,
				instanceId: "plugin-instance",
			}),
			undefined,
		);
	});

	it("plugin context includes event emitter methods", () => {
		const install = vi.fn();
		Navigator.create({ id: "plugin-emitter", plugins: [{ install }] });
		const ctx = install.mock.calls[0][0];
		expect(typeof ctx.on).toBe("function");
		expect(typeof ctx.off).toBe("function");
		expect(typeof ctx.emit).toBe("function");
	});

	it("plugin context includes provide, addButton, addPanel", () => {
		const install = vi.fn();
		Navigator.create({ id: "plugin-ctx", plugins: [{ install }] });
		const ctx = install.mock.calls[0][0];
		expect(typeof ctx.provide).toBe("function");
		expect(typeof ctx.addButton).toBe("function");
		expect(typeof ctx.addPanel).toBe("function");
	});

	it("provide() delegates to app.provide()", () => {
		const install = vi.fn(({ provide }) => {
			provide("myKey", "myValue");
		});
		Navigator.create({ id: "plugin-provide", plugins: [{ install }] });
		expect(mockApp.provide).toHaveBeenCalledWith("myKey", "myValue");
	});

	it("addButton() appends to the reactive buttons ref", () => {
		const btn = { id: "added", icon: "star", label: "Added" };
		const install = vi.fn(({ addButton }) => addButton(btn));
		Navigator.create({ id: "plugin-addbtn", plugins: [{ install }] });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorButtons");
		expect(call[1].value).toContainEqual(btn);
	});

	it("addPanel() appends to the reactive panels ref", () => {
		const panel = { id: "added", icon: "info-circle", title: "Added" };
		const install = vi.fn(({ addPanel }) => addPanel(panel));
		Navigator.create({ id: "plugin-addpnl", plugins: [{ install }] });
		const call = mockApp.provide.mock.calls.find((c) => c[0] === "navigatorPanels");
		expect(call[1].value).toContainEqual(panel);
	});

	it("per-instance plugins support tuple syntax [plugin, options]", () => {
		const install = vi.fn();
		const opts = { maxDuration: 3600 };
		Navigator.create({ id: "plugin-tuple", plugins: [[{ install }, opts]] });
		expect(install).toHaveBeenCalledWith(
			expect.objectContaining({ instanceId: "plugin-tuple" }),
			opts,
		);
	});

	it("per-instance plugins support object syntax { plugin, options }", () => {
		const install = vi.fn();
		const opts = { maxDuration: 3600 };
		Navigator.create({
			id: "plugin-obj",
			plugins: [{ plugin: { install }, options: opts }],
		});
		expect(install).toHaveBeenCalledWith(
			expect.objectContaining({ instanceId: "plugin-obj" }),
			opts,
		);
	});

	it("Navigator.use() returns Navigator for chaining", () => {
		const result = Navigator.use({ install: vi.fn() });
		expect(result).toBe(Navigator);
	});

	it("ignores plugins without install method", () => {
		expect(() => Navigator.use({})).not.toThrow();
		expect(() => Navigator.use(null)).not.toThrow();
	});
});

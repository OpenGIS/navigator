import { createApp, inject as vueInject, shallowRef } from "vue";
import App from "./App.vue";
import "./assets/sass/theme.scss";
import "bootstrap";
import EventEmitter from "./classes/EventEmitter.js";
import { getMapInstance as _getMapInstance } from "./composables/useMap.js";
import { useStorage as _useStorage } from "./composables/useStorage.js";

export { getMapInstance } from "./composables/useMap.js";
export { useUI } from "./composables/useUI.js";
export { useStorage } from "./composables/useStorage.js";
export { useLocate } from "./composables/useLocate.js";

/**
 * Vue-idiomatic composable for accessing the MapLibre map instance.
 * Resolves the instance ID via inject('navigatorId') internally.
 * Must be called inside a Vue component's setup context within
 * Navigator's component tree (e.g. a custom button or panel component).
 *
 * @returns {{ map: import('maplibre-gl').Map | null }}
 */
export const useMap = () => {
	const instanceId = vueInject("navigatorId", "navigator");
	return { map: _getMapInstance(instanceId) };
};

/**
 * @typedef {Object} ButtonConfig
 * @property {string} id - Unique button identifier
 * @property {string} [icon] - Icon name from the sprite (required unless component is provided)
 * @property {string} [label] - Button label text (required unless component is provided)
 * @property {'start'|'middle'|'end'} [position='end'] - Toolbar position
 * @property {import('vue').Component} [component] - Vue component to render instead of the default icon button
 * @property {Object} [props] - Props to pass to the Vue component
 * @property {Function} [onClick] - Click handler, receives { map, instanceId }
 * @property {PanelConfig} [panel] - Optional panel to open on click
 */

/**
 * @typedef {Object} PanelConfig
 * @property {string} id - Unique panel identifier
 * @property {string} icon - Icon name from the sprite
 * @property {string} title - Tab label
 * @property {import('vue').Component} [component] - Vue component to render (preferred)
 * @property {Object} [props] - Props to pass to the Vue component
 * @property {Function} [render] - Called with (container, { map, instanceId }) to populate content (DOM-based alternative)
 */

/**
 * @typedef {Object} NavigatorPlugin
 * @property {Function} install - Called with (context, options). May return a cleanup function.
 *
 * Plugin context properties:
 * - `app` — Vue 3 App instance
 * - `instanceId` — Navigator instance ID
 * - `map` — `shallowRef(null)` that becomes the MapLibre instance on `map:ready`
 * - `useStorage(namespace, defaults)` — pre-scoped reactive localStorage (no instanceId needed)
 * - `getMap()` — returns the current MapLibre instance or null (pre-scoped)
 * - `onMapReady(callback)` — called with `{ map, addSource, addLayer }` when MapLibre loads; sources/layers are auto-removed on unmount
 * - `on(event, fn)` / `once(event, fn)` / `off(event, fn)` / `emit(event, ...args)` — event emitter
 * - `provide(key, value)` — share data with Vue components
 * - `addButton(config)` / `addPanel(config)` — register toolbar UI
 */

/**
 * @typedef {(NavigatorPlugin|[NavigatorPlugin, Object]|{plugin: NavigatorPlugin, options?: Object})} PluginEntry
 * A per-instance plugin. Accepted forms:
 * - `MyPlugin` — plugin object, no options
 * - `[MyPlugin, { opt: 1 }]` — tuple of [plugin, options]
 * - `{ plugin: MyPlugin, options: { opt: 1 } }` — object with plugin and options
 */

/**
 * @typedef {Object} NavigatorConfig
 * @property {string} [id='navigator'] - Unique instance identifier
 * @property {boolean} [debug=false] - Enable debug mode
 * @property {string} [locale] - Default language code (e.g. 'fr')
 * @property {Object} [messages={}] - Per-language label overrides
 * @property {Object} [mapOptions={}] - MapLibre Map constructor options
 * @property {ButtonConfig[]} [buttons=[]] - Custom toolbar buttons
 * @property {PanelConfig[]} [panels=[]] - Custom panel tabs (no toolbar button)
 * @property {PluginEntry[]} [plugins=[]] - Per-instance plugins
 * @property {Function} [onMapReady] - Called when the map finishes loading
 * @property {Function} [onViewChange] - Called on map moveend with { center, zoom }
 * @property {Function} [onThemeChange] - Called when the resolved theme changes
 * @property {Function} [onPanelChange] - Called when the active panel tab changes
 */

// Per-instance emitters, accessible from composables via getEmitter()
const emitters = new Map();

/** @param {string} instanceId */
export const getEmitter = (instanceId) => emitters.get(instanceId) ?? null;

// Global plugins registered via Navigator.use()
const globalPlugins = [];

/**
 * A mounted Navigator instance.
 * Wraps the Vue app and exposes the event emitter for external listeners.
 */
class NavigatorInstance {
	/**
	 * @param {import('vue').App} app
	 * @param {string} id
	 * @param {EventEmitter} emitter
	 * @param {HTMLElement} el
	 */
	constructor(app, id, emitter, el) {
		this.app = app;
		this.id = id;
		this._emitter = emitter;
		this._el = el;
		this._mounted = false;
		/** @type {Function[]} */
		this._cleanups = [];
	}

	/** Mount the Vue app to the DOM. */
	mount() {
		if (this._mounted) return this;
		this.app.mount(this._el);
		this._mounted = true;
		return this;
	}

	/** Unmount and clean up. Emits `destroy` before teardown. */
	unmount() {
		if (!this._mounted) return this;
		this._emitter.emit("destroy");
		for (const fn of this._cleanups) {
			try { fn(); } catch { /* ignore cleanup errors */ }
		}
		this._cleanups.length = 0;
		this.app.unmount();
		this._mounted = false;
		emitters.delete(this.id);
		return this;
	}

	/** @param {string} event @param {Function} fn */
	on(event, fn) {
		this._emitter.on(event, fn);
		return this;
	}

	/** @param {string} event @param {Function} fn */
	once(event, fn) {
		this._emitter.once(event, fn);
		return this;
	}

	/** @param {string} event @param {Function} [fn] */
	off(event, fn) {
		this._emitter.off(event, fn);
		return this;
	}

	/** @param {string} event @param {...*} args */
	emit(event, ...args) {
		this._emitter.emit(event, ...args);
		return this;
	}
}

const Navigator = {
	/**
	 * Register a global plugin that will be installed on every instance.
	 *
	 * @param {NavigatorPlugin} plugin
	 * @param {Object} [options]
	 * @returns {typeof Navigator}
	 */
	use(plugin, options) {
		if (plugin && typeof plugin.install === "function") {
			globalPlugins.push({ plugin, options });
		}
		return this;
	},

	/**
	 * Create a Navigator instance without mounting it.
	 * Use the returned NavigatorInstance to configure the Vue app,
	 * register event listeners, and then call .mount().
	 *
	 * @param {NavigatorConfig} config
	 * @returns {NavigatorInstance}
	 *
	 * @example
	 * import Navigator from '@ogis/navigator'
	 * import '@ogis/navigator/navigator.css'
	 *
	 * const nav = Navigator.create({ id: 'my-map', locale: 'fr' })
	 * nav.on('map:ready', ({ map }) => console.log('Map loaded'))
	 * nav.mount()
	 */
	create({
		id = "navigator",
		debug = false,
		locale = null,
		messages = {},
		mapOptions = {},
		buttons = [],
		panels = [],
		plugins = [],
		onMapReady,
		onViewChange,
		onThemeChange,
		onPanelChange,
	} = {}) {
		let el = document.getElementById(id);
		if (!el) {
			el = document.createElement("div");
			el.id = id;
			document.body.appendChild(el);
		}

		// Create per-instance event emitter
		const emitter = new EventEmitter();
		emitters.set(id, emitter);

		// Register lifecycle callbacks as event listeners
		if (typeof onMapReady === "function") emitter.on("map:ready", onMapReady);
		if (typeof onViewChange === "function") emitter.on("view:change", onViewChange);
		if (typeof onThemeChange === "function") emitter.on("theme:change", onThemeChange);
		if (typeof onPanelChange === "function") emitter.on("panel:change", onPanelChange);

		const app = createApp(App, { debug, mapOptions });
		app.provide("navigatorId", id);
		app.provide("navigatorLocale", locale);
		app.provide("navigatorMessages", messages);

		// Reactive buttons/panels so plugins can register UI via addButton/addPanel
		const buttonsRef = shallowRef([...buttons]);
		const panelsRef = shallowRef([...panels]);
		app.provide("navigatorButtons", buttonsRef);
		app.provide("navigatorPanels", panelsRef);

		const instance = new NavigatorInstance(app, id, emitter, el);

		// Reactive map ref — null until MapLibre loads
		const mapRef = shallowRef(null);
		emitter.once("map:ready", ({ map }) => { mapRef.value = map; });

		// Auto-cleanup tracking for plugin-added map sources/layers
		const trackedSources = [];
		const trackedLayers = [];

		emitter.on("destroy", () => {
			mapRef.value = null;
			const map = _getMapInstance(id);
			if (map) {
				for (const layerId of [...trackedLayers].reverse()) {
					if (map.getLayer(layerId)) map.removeLayer(layerId);
				}
				for (const sourceId of [...trackedSources].reverse()) {
					if (map.getSource(sourceId)) map.removeSource(sourceId);
				}
			}
		});

		// Build plugin context
		const ctx = {
			app,
			instanceId: id,
			map: mapRef,
			useStorage: (namespace, defaultState) => _useStorage(namespace, defaultState, id),
			getMap: () => _getMapInstance(id),
			onMapReady: (callback) => {
				emitter.once("map:ready", ({ map }) => {
					callback({
						map,
						addSource: (sourceId, options) => {
							map.addSource(sourceId, options);
							trackedSources.push(sourceId);
						},
						addLayer: (layerConfig, before) => {
							map.addLayer(layerConfig, before);
							trackedLayers.push(layerConfig.id);
						},
					});
				});
			},
			on: (e, f) => emitter.on(e, f),
			once: (e, f) => emitter.once(e, f),
			off: (e, f) => emitter.off(e, f),
			emit: (e, ...a) => emitter.emit(e, ...a),
			provide: (key, value) => app.provide(key, value),
			addButton: (config) => {
				buttonsRef.value = [...buttonsRef.value, config];
			},
			addPanel: (config) => {
				panelsRef.value = [...panelsRef.value, config];
			},
		};

		// Install global plugins
		for (const { plugin, options } of globalPlugins) {
			const cleanup = plugin.install(ctx, options);
			if (typeof cleanup === "function") instance._cleanups.push(cleanup);
		}

		// Install per-instance plugins (supports plain object, tuple, or { plugin, options })
		for (const entry of plugins) {
			let plugin, options;
			if (Array.isArray(entry)) {
				[plugin, options] = entry;
			} else if (entry && entry.plugin && typeof entry.plugin.install === "function") {
				plugin = entry.plugin;
				options = entry.options;
			} else if (entry && typeof entry.install === "function") {
				plugin = entry;
			}
			if (plugin) {
				const cleanup = plugin.install(ctx, options);
				if (typeof cleanup === "function") instance._cleanups.push(cleanup);
			}
		}

		return instance;
	},
};

export default Navigator;

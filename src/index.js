import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

/**
 * @typedef {Object} NavigatorConfig
 * @property {string} [id='navigator'] - Unique instance identifier. A <div> with this id is
 *   mounted to if one does not already exist in the DOM. Also used to namespace localStorage
 *   keys so multiple instances on the same page do not collide.
 * @property {boolean} [debug=false] - Enable debug mode
 * @property {string} [locale] - Default language code (e.g. 'fr'). Used when the user has no
 *   stored preference. Falls back to the browser language, then English.
 * @property {Object} [messages={}] - Per-language label overrides. Keys are language codes;
 *   values are objects mapping translation keys to replacement strings.
 *   Example: { en: { 'about.title': 'My Map' }, fr: { 'about.title': 'Ma carte' } }
 * @property {Object} [mapOptions={}] - Options passed directly to the MapLibre Map constructor
 */

const Navigator = {
	/**
	 * Initialise and mount a Navigator instance.
	 *
	 * @param {NavigatorConfig} config
	 * @returns {import('vue').App} The mounted Vue application instance
	 *
	 * @example
	 * import Navigator from '@ogis/navigator'
	 * import '@ogis/navigator/navigator.css'
	 *
	 * Navigator.init({ id: 'my-map', locale: 'fr' })
	 */
	init({ id = "navigator", debug = false, locale = null, messages = {}, mapOptions = {} } = {}) {
		let el = document.getElementById(id);
		if (!el) {
			el = document.createElement("div");
			el.id = id;
			document.body.appendChild(el);
		}

		const app = createApp(App, { debug, mapOptions });
		app.provide("navigatorId", id);
		app.provide("navigatorLocale", locale);
		app.provide("navigatorMessages", messages);
		app.mount(el);
		return app;
	},
};

export default Navigator;

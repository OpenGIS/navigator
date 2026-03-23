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
	 * Navigator.init({ id: 'my-map' })
	 */
	init({ id = "navigator", debug = false, mapOptions = {} } = {}) {
		let el = document.getElementById(id);
		if (!el) {
			el = document.createElement("div");
			el.id = id;
			document.body.appendChild(el);
		}

		const app = createApp(App, { debug, mapOptions });
		app.provide("navigatorId", id);
		app.mount(el);
		return app;
	},
};

export default Navigator;

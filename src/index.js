import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

/**
 * @typedef {Object} NavigatorConfig
 * @property {string|HTMLElement} [el='#app'] - Target element or CSS selector to mount Navigator into
 * @property {boolean} [debug=false] - Enable Waymark debug mode
 * @property {Object} [mapOptions={}] - Options passed directly to the Waymark map instance
 */

const Navigator = {
	/**
	 * Initialise and mount the Navigator application into a target element.
	 *
	 * @param {NavigatorConfig} config
	 * @returns {import('vue').App} The mounted Vue application instance
	 *
	 * @example
	 * import Navigator from '@ogis/navigator'
	 * import '@ogis/navigator/navigator.css'
	 *
	 * Navigator.init({ el: '#my-map' })
	 */
	init({ el = "#app", debug = false, mapOptions = {} } = {}) {
		const app = createApp(App, { debug, mapOptions });
		app.mount(el);
		return app;
	},
};

export default Navigator;

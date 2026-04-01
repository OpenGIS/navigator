/**
 * Default MapLibre GL JS options used by Navigator.
 *
 * Centralised here so they can be imported by composables, tests, and plugins
 * without duplicating magic values.
 */

/** Default map constructor options merged into every `new maplibregl.Map()`. */
export const mapDefaults = {
    style: "https://tiles.openfreemap.org/styles/bright",
    attributionControl: true,
};

/** Zoom level applied on the first GPS fix in the Locate feature. */
export const locateZoom = 16;

/** Max pixel width of the MapLibre ScaleControl. */
export const scaleMaxWidth = 120;

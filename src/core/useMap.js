import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import { useStorage } from "@/composables/useStorage";
import { parseUrlHash, updateUrlHash } from "@/composables/useUrlHash";
import { useSettings } from "@/features/settings/useSettings";

// Per-instance cache: instanceId -> { state, mapInstance }
const mapCache = new Map();

function throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
}

/**
 * Composable for MapLibre map lifecycle management.
 *
 * Call with (containerRef, options) from a component setup context to initialise
 * the map and register mount/unmount lifecycle hooks.
 * Call without arguments from any context to access the current map instance.
 *
 * @param {import('vue').Ref<HTMLElement|null>} [containerRef] - Template ref for the map container element
 * @param {Object} [options={}] - MapLibre MapOptions to merge with defaults
 */
export const useMap = (containerRef = null, options = {}) => {
    const instanceId = inject("navigatorId", "navigator");

    if (!mapCache.has(instanceId)) {
        mapCache.set(instanceId, {
            state: useStorage("view", { mapView: { center: null, zoom: null } }),
            mapInstance: null,
            scaleControl: null,
            currentView: ref(null),
        });
    }

    const cached = mapCache.get(instanceId);

    if (containerRef !== null) {
        const { isMetric } = useSettings();

        // Keep the scale control unit in sync with the units preference.
        watch(isMetric, (metric) => {
            if (cached.scaleControl) {
                cached.scaleControl.setUnit(metric ? "metric" : "imperial");
            }
        });

        onMounted(() => {
            const map = new maplibregl.Map({
                container: containerRef.value,
                style: "https://tiles.openfreemap.org/styles/bright",
                attributionControl: true,
                ...options,
            });

            map.on("load", () => {
                // Determine initial view: URL hash takes priority over localStorage
                const hashView = parseUrlHash();
                const hasStoredView = !!(
                    cached.state.mapView.center && cached.state.mapView.zoom
                );
                if (hashView) {
                    map.jumpTo({ center: hashView.center, zoom: hashView.zoom });
                } else if (hasStoredView) {
                    map.jumpTo({
                        center: cached.state.mapView.center,
                        zoom: cached.state.mapView.zoom,
                    });
                }

                // Update the reactive ref and URL hash from the current map state.
                // Does NOT write localStorage — that only happens on user movement.
                const refreshView = () => {
                    const c = map.getCenter();
                    const z = map.getZoom();
                    cached.currentView.value = { lat: c.lat, lng: c.lng, zoom: z };
                    updateUrlHash(z, c.lat, c.lng);
                };

                // Only populate currentView when there is a meaningful view to share
                // (a URL hash or a previously persisted view). On a true first visit
                // currentView stays null so the "Current view / Share this view"
                // section in the menu remains hidden.
                if (hashView || hasStoredView) {
                    refreshView();
                } else {
                    // Still write the URL hash even on a first visit
                    const c = map.getCenter();
                    const z = map.getZoom();
                    updateUrlHash(z, c.lat, c.lng);
                }

                // On map movement: persist to localStorage, update ref, and update hash
                map.on(
                    "moveend",
                    throttle(() => {
                        const c = map.getCenter();
                        const z = map.getZoom();
                        cached.state.mapView.center = c;
                        cached.state.mapView.zoom = z;
                        cached.currentView.value = { lat: c.lat, lng: c.lng, zoom: z };
                        updateUrlHash(z, c.lat, c.lng);
                    }, 1000),
                );

                cached.mapInstance = map;

                // Scale bar — unit follows the units preference in settings.
                const scaleControl = new maplibregl.ScaleControl({
                    maxWidth: 120,
                    unit: isMetric.value ? "metric" : "imperial",
                });
                map.addControl(scaleControl, "bottom-right");
                cached.scaleControl = scaleControl;
            });
        });

        onUnmounted(() => {
            cached.mapInstance?.remove();
            cached.mapInstance = null;
            mapCache.delete(instanceId);
        });
    }

    return {
        map: cached.mapInstance,
        currentView: cached.currentView,
    };
};

/**
 * Retrieve the MapLibre map instance for a given Navigator instance ID
 * without requiring a Vue inject context. Use this from callbacks or
 * composables that run outside of component setup (e.g. geolocation handlers).
 *
 * @param {string} instanceId - The Navigator instance ID (from inject or cached)
 * @returns {import('maplibre-gl').Map | null}
 */
export const getMapInstance = (instanceId) => {
    const cached = mapCache.get(instanceId);
    return cached ? cached.mapInstance : null;
};


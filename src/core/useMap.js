import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { onMounted, onUnmounted } from "vue";
import { useStorage } from "@/composables/useStorage";

const state = useStorage("view", {
    mapView: {
        center: null,
        zoom: null,
    },
});

let mapInstance = null;

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
    if (containerRef !== null) {
        onMounted(() => {
            const map = new maplibregl.Map({
                container: containerRef.value,
                style: "https://tiles.openfreemap.org/styles/bright",
                attributionControl: true,
                ...options,
            });

            map.on("load", () => {
                // Restore persisted map view
                if (state.mapView.center && state.mapView.zoom) {
                    map.jumpTo({
                        center: state.mapView.center,
                        zoom: state.mapView.zoom,
                    });
                }

                // Persist map view on movement
                map.on(
                    "moveend",
                    throttle(() => {
                        state.mapView.center = map.getCenter();
                        state.mapView.zoom = map.getZoom();
                    }, 1000),
                );

                mapInstance = map;
            });
        });

        onUnmounted(() => {
            mapInstance?.remove();
            mapInstance = null;
        });
    }

    return {
        map: mapInstance,
    };
};


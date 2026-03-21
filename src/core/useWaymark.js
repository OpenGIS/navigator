import { throttle } from "lodash-es";
import { useStorage } from "@/composables/useStorage";

const state = useStorage("waymark", {
    mapView: {
        center: null,
        zoom: null,
    },
});

let waymarkInstance = null;
const instanceReadyCallbacks = [];

export const useWaymark = () => {
    const setInstance = (instance) => {
        waymarkInstance = instance;

        // Check for MapLibre map
        if (typeof waymarkInstance.mapLibreMap?.on !== "function") {
            throw new Error("Waymark instance does not have a MapLibre map.");
        }

        // Check store for persisted map view and set it
        if (state.mapView.center && state.mapView.zoom) {
            waymarkInstance.mapLibreMap.jumpTo({
                center: state.mapView.center,
                zoom: state.mapView.zoom,
            });
        }

        // Listen for map view changes and persist them
        waymarkInstance.mapLibreMap.on(
            "moveend",
            throttle(() => {
                state.mapView.center = waymarkInstance.mapLibreMap.getCenter();
                state.mapView.zoom = waymarkInstance.mapLibreMap.getZoom();
            }, 1000),
        );

        // Fire any callbacks that were waiting for the instance to be ready
        while (instanceReadyCallbacks.length) {
            instanceReadyCallbacks.shift()();
        }
    };

    // Calls callback immediately if the instance is already set,
    // otherwise queues it until setInstance is called.
    const whenReady = (callback) => {
        if (waymarkInstance) {
            callback();
        } else {
            instanceReadyCallbacks.push(callback);
        }
    };

    return {
        // State
        waymarkInstance,

        // Actions
        setInstance,
        whenReady,
    };
};

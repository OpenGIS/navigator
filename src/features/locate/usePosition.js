import { computed } from "vue";
import { useStorage } from "@/composables/useStorage";
import { getGeoLocation } from "@/helpers/Navigator";
import {
    watchCompass,
    clearCompass,
    requestCompassPermission,
} from "@/helpers/Compass";
import Position from "@/classes/Position";
import { addPositionIcons } from "@/helpers/mapIcons";

import { useMap } from "@/core/useMap";

const SOURCE_ID = "navigator-position";
const LAYER_ID = "navigator-position-layer";

// Singleton State
const state = useStorage("position", {
    positionMode: null, // null, 'show', 'follow'
    currentPosition: null,
    positionHistory: [],
});

let intervalId = null;
let compassHandler = null;

let lastHeading = null;

export const usePosition = () => {
    const updateHeading = (heading) => {
        lastHeading = heading;
    };

    const positionToFeature = (pos) => ({
        type: "Feature",
        id: pos.id,
        geometry: pos.geometry,
        properties: pos.properties,
    });

    const updateMap = async () => {
        if (!state.currentPosition) return;

        const { map } = useMap();
        if (!map) return;

        await addPositionIcons(map);

        const feature = positionToFeature(state.currentPosition);
        const featureCollection = {
            type: "FeatureCollection",
            features: [feature],
        };

        if (map.getSource(SOURCE_ID)) {
            map.getSource(SOURCE_ID).setData(featureCollection);
        } else {
            map.addSource(SOURCE_ID, {
                type: "geojson",
                data: featureCollection,
            });
            map.addLayer({
                id: LAYER_ID,
                type: "symbol",
                source: SOURCE_ID,
                layout: {
                    // Switch between icons based on whether heading is available
                    "icon-image": [
                        "case",
                        ["!=", ["get", "heading"], null],
                        "position-heading",
                        "position",
                    ],
                    // Rotate the icon to match the heading (0 when none)
                    "icon-rotate": ["coalesce", ["get", "heading"], 0],
                    "icon-rotation-alignment": "map",
                    "icon-allow-overlap": true,
                    "icon-size": 1,
                },
            });
        }

        // Follow logic
        if (state.positionMode === "follow") {
            map.jumpTo({
                center: state.currentPosition.geometry.coordinates.slice(0, 2),
            });
        }
    };

    const removeFromMap = () => {
        const { map } = useMap();
        if (!map) return;
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };

    const updatePosition = async () => {
        // Get GeoLocation
        // https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
        const geoLocation = await getGeoLocation();

        if (state.currentPosition instanceof Position) {
            state.currentPosition.update(geoLocation, lastHeading);
        } else {
            state.currentPosition = new Position(geoLocation, lastHeading, {
                id: "current-position",
            });
        }

        // Add to history
        // Create a snapshot for history so it doesn't get updated
        const historySnapshot = new Position(geoLocation, lastHeading, {
            id: "current-position",
        });

        state.positionHistory.unshift(historySnapshot);
        if (state.positionHistory.length > 5) {
            state.positionHistory = state.positionHistory.slice(0, 5);
        }

        updateMap();
    };

    const startPositioning = async () => {
        if (intervalId) return;

        // Compass
        try {
            await requestCompassPermission();
        } catch (error) {
            console.error("Error requesting compass permission:", error);
        }

        await updatePosition();

        // Start Interval for position updates
        intervalId = setInterval(() => {
            updatePosition();
        }, 5000);

        // Watch Compass
        compassHandler = watchCompass((heading) => {
            updateHeading(heading);
            updateMap();
        });
    };

    const stopPositioning = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }

        if (compassHandler) {
            clearCompass(compassHandler);
            compassHandler = null;
        }
    };

    const cyclePositionMode = async () => {
        if (!state.positionMode) {
            // Check if first time
            const isFirstTime = state.positionHistory.length === 0;

            state.positionMode = "show";
            await startPositioning();

            const { map } = useMap();
            if (state.currentPosition && map) {
                const jumpOptions = {
                    center: state.currentPosition.geometry.coordinates.slice(
                        0,
                        2,
                    ),
                };

                if (isFirstTime) {
                    jumpOptions.zoom = 14;
                }

                map.jumpTo(jumpOptions);
            }
        } else if (state.positionMode === "show") {
            state.positionMode = "follow";
            updateMap(); // Center map immediately
        } else {
            state.positionMode = null;
            stopPositioning();
            removeFromMap();
        }
    };

    // Initialize logic:
    // If state is loaded as not null (from localStorage), ensure we resume positioning.
    if (state.positionMode && !intervalId) {
        startPositioning();
    }

    return {
        positionMode: computed(() => state.positionMode),
        currentPosition: computed(() => state.currentPosition),
        cyclePositionMode,
        startPositioning,
        stopPositioning,
    };
};


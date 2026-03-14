import { computed } from "vue";
import { useStorage } from "@/composables/useStorage";
import { getGeoLocation } from "@/helpers/Navigator";
import {
    watchCompass,
    clearCompass,
    requestCompassPermission,
} from "@/helpers/Compass";
import Position from "@/classes/Position";

import { useWaymark } from "@/core/useWaymark";

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

    const updateMap = () => {
        if (!state.currentPosition) return;

        const { waymarkInstance } = useWaymark();

        if (!waymarkInstance) return;

        // Add or update position on map
        if (waymarkInstance.geoJSONStore.hasItem(state.currentPosition.id)) {
            waymarkInstance.geoJSONStore.updateItem(state.currentPosition);
        } else {
            waymarkInstance.geoJSONStore.addItem(state.currentPosition);
        }

        // Follow logic
        if (state.positionMode === "follow") {
            waymarkInstance.mapLibreMap.jumpTo({
                center: state.currentPosition.geometry.coordinates.slice(0, 2),
            });
        }
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

            const { waymarkInstance } = useWaymark();
            if (state.currentPosition) {
                const jumpOptions = {
                    center: state.currentPosition.geometry.coordinates.slice(
                        0,
                        2,
                    ),
                };

                if (isFirstTime) {
                    jumpOptions.zoom = 14;
                }

                waymarkInstance.mapLibreMap.jumpTo(jumpOptions);
            }
        } else if (state.positionMode === "show") {
            state.positionMode = "follow";
            updateMap(); // Center map immediately
        } else {
            state.positionMode = null;
            stopPositioning();

            // Remove position from map
            const { waymarkInstance } = useWaymark();
            if (state.currentPosition) {
                waymarkInstance.geoJSONStore.removeItem(state.currentPosition);
            }
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

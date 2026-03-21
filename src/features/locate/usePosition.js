import { computed } from "vue";
import { useStorage } from "@/composables/useStorage";
import {
    getGeoLocation,
    watchPosition,
    clearWatchPosition,
} from "@/helpers/Navigator";
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

let watchId = null;
let compassHandler = null;

let lastHeading = null;
let lastGeoLocation = null;
let pendingMapUpdate = false;

export const usePosition = () => {
    const updateMap = () => {
        if (!state.currentPosition) return;

        const { waymarkInstance, whenReady } = useWaymark();

        if (!waymarkInstance) {
            // Map not ready yet; defer until the Waymark instance is available.
            // The flag prevents stacking duplicate callbacks.
            if (!pendingMapUpdate) {
                pendingMapUpdate = true;
                whenReady(() => {
                    pendingMapUpdate = false;
                    updateMap();
                });
            }
            return;
        }

        // Add or update the single position feature on the map
        if (waymarkInstance.geoJSONStore.hasItem(state.currentPosition.id)) {
            waymarkInstance.geoJSONStore.updateItem(state.currentPosition);
        } else {
            waymarkInstance.geoJSONStore.addItem(state.currentPosition);
        }

        if (state.positionMode === "follow") {
            waymarkInstance.mapLibreMap.jumpTo({
                center: state.currentPosition.geometry.coordinates.slice(0, 2),
            });
        }
    };

    // Called by watchPosition — fires whenever the device moves
    const updatePosition = (geoLocation) => {
        lastGeoLocation = geoLocation;

        if (state.currentPosition instanceof Position) {
            state.currentPosition.update(geoLocation, lastHeading);
        } else {
            state.currentPosition = new Position(geoLocation, lastHeading, {
                id: "current-position",
            });
        }

        // Snapshot for history (unaffected by future updates)
        const historySnapshot = new Position(geoLocation, lastHeading, {
            id: "current-position",
        });

        state.positionHistory.unshift(historySnapshot);
        if (state.positionHistory.length > 5) {
            state.positionHistory = state.positionHistory.slice(0, 5);
        }

        updateMap();
    };

    // Called by watchCompass — immediately reflects heading in the marker
    const updateHeading = (heading) => {
        lastHeading = heading;

        if (state.currentPosition instanceof Position && lastGeoLocation) {
            state.currentPosition.update(lastGeoLocation, heading);
            updateMap();
        }
    };

    const startPositioning = async () => {
        if (watchId !== null) return;

        // Request compass permission upfront (iOS requires a user-gesture context)
        try {
            await requestCompassPermission();
        } catch (error) {
            console.error("Error requesting compass permission:", error);
        }

        // Watch compass — updates heading and redraws marker on every change
        compassHandler = watchCompass(updateHeading);

        // Get the initial fix so cyclePositionMode can jump the map immediately.
        // watchPosition alone is unreliable for the first callback timing across
        // browsers and test environments.
        try {
            const geoLocation = await getGeoLocation();
            updatePosition(geoLocation);
        } catch (error) {
            console.error("Initial position error:", error);
        }

        // Hand off to watchPosition for all subsequent movement-triggered updates
        watchId = watchPosition(
            (geoLocation) => updatePosition(geoLocation),
            (error) => console.error("Position watch error:", error),
            { enableHighAccuracy: true },
        );
    };

    const stopPositioning = () => {
        if (watchId !== null) {
            clearWatchPosition(watchId);
            watchId = null;
        }

        if (compassHandler) {
            clearCompass(compassHandler);
            compassHandler = null;
        }

        lastHeading = null;
        lastGeoLocation = null;
        pendingMapUpdate = false;
    };

    const cyclePositionMode = async () => {
        if (!state.positionMode) {
            // Check if first time ever (determines whether to force zoom=14)
            const isFirstTime = state.positionHistory.length === 0;

            state.positionMode = "show";
            await startPositioning();

            // Jump to the user's position once the map instance is ready
            const { waymarkInstance, whenReady } = useWaymark();
            const jumpToPosition = () => {
                const { waymarkInstance: wm } = useWaymark();
                if (wm && state.currentPosition) {
                    const jumpOptions = {
                        center: state.currentPosition.geometry.coordinates.slice(
                            0,
                            2,
                        ),
                    };
                    if (isFirstTime) jumpOptions.zoom = 14;
                    wm.mapLibreMap.jumpTo(jumpOptions);
                }
            };

            if (waymarkInstance) {
                jumpToPosition();
            } else {
                whenReady(jumpToPosition);
            }
        } else if (state.positionMode === "show") {
            state.positionMode = "follow";
            updateMap();
        } else {
            state.positionMode = null;
            stopPositioning();

            const { waymarkInstance } = useWaymark();
            if (waymarkInstance && state.currentPosition) {
                waymarkInstance.geoJSONStore.removeItem(state.currentPosition);
            }
        }
    };

    // Resume positioning if positionMode was persisted to localStorage
    if (state.positionMode && watchId === null) {
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

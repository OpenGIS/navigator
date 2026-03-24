import { ref, computed, inject } from "vue";
import maplibregl from "maplibre-gl";
import { useStorage } from "@/composables/useStorage";
import { getMapInstance } from "@/core/useMap";
import { Position } from "@/classes/Position";

// Per-instance cache: instanceId -> instance state
const locateCache = new Map();

// Smoothing factor for compass heading (0 = no update, 1 = no smoothing).
// 0.15 is a gentle low-pass that removes jitter while still tracking rotation.
const HEADING_SMOOTH = 0.15;

/** Interpolate between two angles (degrees) handling the 0°/360° wrap. */
function smoothAngle(current, next, factor) {
    let diff = next - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return (current + diff * factor + 360) % 360;
}

/**
 * Composable for the Locate feature.
 *
 * Manages GPS tracking state, map markers, and the permission flow.
 * State is cached per Navigator instance and shared across all callers.
 */
export const useLocate = () => {
    const instanceId = inject("navigatorId", "navigator");

    if (!locateCache.has(instanceId)) {
        locateCache.set(instanceId, {
            storage: useStorage("locate", { permissionGranted: false }),
            mode: ref(null), // null | 'active' | 'following' | 'error'
            position: ref(null), // Position | null
            compassHeading: ref(null), // smoothed DeviceOrientation compass bearing
            smoothedHeading: null, // internal: raw float used for smoothing
            showConfirmModal: ref(false),
            showErrorModal: ref(false),
            watcherId: null,
            orientationListener: null, // { eventName, handler }
            positionMarker: null,
            headingMarker: null,
        });
    }

    const c = locateCache.get(instanceId);

    // ─── Map markers ─────────────────────────────────────────────────────────

    const createPositionElement = () => {
        const el = document.createElement("div");
        el.className = "navigator-locate-position";
        el.innerHTML = `<svg width="32" height="32" fill="currentColor"><use href="#position"/></svg>`;
        return el;
    };

    const createHeadingElement = () => {
        const el = document.createElement("div");
        el.className = "navigator-locate-heading";
        el.innerHTML = `<svg width="32" height="32" fill="currentColor"><use href="#position-heading"/></svg>`;
        return el;
    };

    /**
     * Sync both markers to the current position and compass heading.
     * Called after every position or orientation update.
     */
    const syncMarkers = () => {
        if (!c.position.value) return;
        const map = getMapInstance(instanceId);
        if (!map) return;

        const { lng, lat } = c.position.value;
        const lngLat = [lng, lat];

        // Position marker
        if (!c.positionMarker) {
            c.positionMarker = new maplibregl.Marker({
                element: createPositionElement(),
                anchor: "center",
            })
                .setLngLat(lngLat)
                .addTo(map);
        } else {
            c.positionMarker.setLngLat(lngLat);
        }

        // Heading marker — only shown when compass data is available
        if (c.compassHeading.value !== null) {
            if (!c.headingMarker) {
                c.headingMarker = new maplibregl.Marker({
                    element: createHeadingElement(),
                    anchor: "center",
                    rotationAlignment: "map",
                })
                    .setLngLat(lngLat)
                    .addTo(map);
            } else {
                c.headingMarker.setLngLat(lngLat);
            }
            c.headingMarker.setRotation(c.compassHeading.value);
        } else if (c.headingMarker) {
            c.headingMarker.remove();
            c.headingMarker = null;
        }
    };

    const removeMarkers = () => {
        c.positionMarker?.remove();
        c.positionMarker = null;
        c.headingMarker?.remove();
        c.headingMarker = null;
    };

    // ─── DeviceOrientation ────────────────────────────────────────────────────

    /**
     * Request DeviceOrientationEvent permission on iOS (Safari ≥ 13).
     * On other platforms the API is available without an explicit grant.
     */
    const requestOrientationPermission = async () => {
        if (typeof DeviceOrientationEvent?.requestPermission === "function") {
            try {
                const result = await DeviceOrientationEvent.requestPermission();
                return result === "granted";
            } catch {
                return false;
            }
        }
        return true;
    };

    const startOrientationWatching = () => {
        if (c.orientationListener) return; // already listening

        const handler = (event) => {
            if (event.alpha === null) return;
            // Skip relative (non-compass) readings from the generic event
            if ("absolute" in event && !event.absolute) return;

            if (c.smoothedHeading === null) {
                c.smoothedHeading = event.alpha;
            } else {
                c.smoothedHeading = smoothAngle(
                    c.smoothedHeading,
                    event.alpha,
                    HEADING_SMOOTH,
                );
            }
            c.compassHeading.value = Math.round(c.smoothedHeading);
            syncMarkers();
        };

        // deviceorientationabsolute always provides an absolute compass bearing.
        // Fall back to deviceorientation on devices that don't fire the absolute event.
        const eventName =
            "ondeviceorientationabsolute" in window
                ? "deviceorientationabsolute"
                : "deviceorientation";

        window.addEventListener(eventName, handler);
        c.orientationListener = { eventName, handler };
    };

    const stopOrientationWatching = () => {
        if (!c.orientationListener) return;
        window.removeEventListener(
            c.orientationListener.eventName,
            c.orientationListener.handler,
        );
        c.orientationListener = null;
        c.smoothedHeading = null;
        c.compassHeading.value = null;
    };

    // ─── Geolocation callbacks ────────────────────────────────────────────────

    const onPosition = (geoPos) => {
        if (!c.storage.permissionGranted) {
            c.storage.permissionGranted = true;
        }

        c.position.value = new Position({
            lat: geoPos.coords.latitude,
            lng: geoPos.coords.longitude,
            heading: geoPos.coords.heading, // direction of travel (may be null at rest)
            accuracy: geoPos.coords.accuracy,
            speed: geoPos.coords.speed,
        });

        syncMarkers();

        if (c.mode.value === "following") {
            const map = getMapInstance(instanceId);
            if (map)
                map.easeTo({
                    center: [c.position.value.lng, c.position.value.lat],
                });
        }
    };

    const onError = (err) => {
        stopWatcher();
        stopOrientationWatching();
        removeMarkers();
        c.mode.value = "error";
        if (err.code === 1 /* PERMISSION_DENIED */) {
            c.showErrorModal.value = true;
        }
    };

    // ─── Internal helpers ─────────────────────────────────────────────────────

    const startWatching = async () => {
        if (!("geolocation" in navigator)) {
            c.mode.value = "error";
            return;
        }
        c.mode.value = "active";

        // Request orientation permission (no-op on non-iOS) then start listening.
        // Both happen inside the same user-gesture call stack so iOS treats them
        // as a single permission prompt.
        await requestOrientationPermission();
        startOrientationWatching();

        c.watcherId = navigator.geolocation.watchPosition(onPosition, onError, {
            enableHighAccuracy: true,
        });
    };

    const stopWatcher = () => {
        if (c.watcherId !== null) {
            navigator.geolocation.clearWatch(c.watcherId);
            c.watcherId = null;
        }
    };

    // ─── Public actions ───────────────────────────────────────────────────────

    /**
     * Cycle through states: inactive → active → following → inactive.
     * In the error state, re-opens the error modal instead.
     * On first use (no stored grant), shows the confirmation modal.
     */
    const cycle = () => {
        if (c.mode.value === "error") {
            c.showErrorModal.value = true;
            return;
        }

        if (c.mode.value === null) {
            if (!c.storage.permissionGranted) {
                c.showConfirmModal.value = true;
            } else {
                startWatching();
            }
        } else if (c.mode.value === "active") {
            c.mode.value = "following";
            if (c.position.value) {
                const map = getMapInstance(instanceId);
                if (map)
                    map.easeTo({
                        center: [c.position.value.lng, c.position.value.lat],
                    });
            }
        } else if (c.mode.value === "following") {
            stop();
        }
    };

    /** Called when the user confirms they understand the permission request. */
    const confirmLocate = () => {
        c.showConfirmModal.value = false;
        startWatching();
    };

    /** Stop tracking and return to the inactive state. */
    const stop = () => {
        stopWatcher();
        stopOrientationWatching();
        removeMarkers();
        c.mode.value = null;
        c.position.value = null;
    };

    return {
        mode: computed(() => c.mode.value),
        position: computed(() => c.position.value),
        compassHeading: computed(() => c.compassHeading.value),
        showConfirmModal: c.showConfirmModal,
        showErrorModal: c.showErrorModal,
        cycle,
        confirmLocate,
        stop,
    };
};

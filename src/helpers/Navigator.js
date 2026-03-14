/* ========================== Wake Lock ========================== */

let wakeLock = null;

export const requestWakeLock = async () => {
    // Check if wake lock is already active to prevent redundant requests
    if (wakeLock && !wakeLock.released) return;

    if ("wakeLock" in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");

            wakeLock.addEventListener("release", () => {
                console.log("Wake Lock released");
                wakeLock = null;
            });
            console.log("Wake Lock active");
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
};

export const releaseWakeLock = async () => {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
        } catch (err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }
};

export const startWakeLock = () => {
    // On every click, request a wake lock
    window.addEventListener("click", () => {
        requestWakeLock();
    });

    // Re-request the wake lock when the page becomes visible again
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            requestWakeLock();
        }
    });
};

/* ========================== Geolocation ========================== */

export const getGeoLocation = (options = {}) => {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
            ...options,
        });
    });
};

export const watchPosition = (successCallback, errorCallback, options = {}) => {
    if (!("geolocation" in navigator)) {
        if (errorCallback) {
            errorCallback(
                new Error("Geolocation is not supported by this browser."),
            );
        }
        return null;
    }
    return navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options,
    );
};

export const clearWatchPosition = (id) => {
    if ("geolocation" in navigator) {
        navigator.geolocation.clearWatch(id);
    }
};

export default {
    requestWakeLock,
    releaseWakeLock,
    getGeoLocation,
    watchPosition,
    clearWatchPosition,
    startWakeLock,
};

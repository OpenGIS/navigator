export const requestCompassPermission = async () => {
    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        const permission = await DeviceOrientationEvent.requestPermission();
        return permission === "granted";
    }
    return true;
};

export const watchCompass = (callback) => {
    const handleOrientation = (event) => {
        let heading = null;

        // iOS
        if (
            event.webkitCompassHeading !== undefined &&
            event.webkitCompassHeading !== null
        ) {
            heading = event.webkitCompassHeading;
            // Non-iOS
        } else if (event.alpha !== null) {
            // Check if absolute or if using deviceorientationabsolute
            if (
                event.absolute === true ||
                event.type === "deviceorientationabsolute"
            ) {
                heading = 360 - event.alpha;
            }
        }

        if (heading !== null) {
            callback(heading);
        }
    };

    if ("ondeviceorientationabsolute" in window) {
        window.addEventListener(
            "deviceorientationabsolute",
            handleOrientation,
            true,
        );
    } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return handleOrientation;
};

export const clearCompass = (handler) => {
    if (handler) {
        window.removeEventListener("deviceorientationabsolute", handler, true);
        window.removeEventListener("deviceorientation", handler, true);
    }
};

export default {
    requestCompassPermission,
    watchCompass,
    clearCompass,
};

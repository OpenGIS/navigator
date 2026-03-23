// https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
export default class Position {
    constructor(geoLocation = {}, heading = null, options = {}) {
        this.id = options.id || "position";
        this.geometry = Position.generateGeometry(geoLocation);
        this.properties = Position.generateProperties(geoLocation, heading);
    }

    update(geoLocation = {}, heading = null) {
        this.geometry = Position.generateGeometry(geoLocation);
        this.properties = Position.generateProperties(geoLocation, heading);
    }

    toFeature() {
        return {
            type: "Feature",
            id: this.id,
            geometry: this.geometry,
            properties: this.properties,
        };
    }

    static generateGeometry(geoLocation) {
        if (
            !geoLocation.coords ||
            typeof geoLocation.coords.longitude !== "number" ||
            typeof geoLocation.coords.latitude !== "number"
        ) {
            return { type: "Point", coordinates: [0, 0] };
        }

        const { coords } = geoLocation;
        const altitude =
            typeof coords.altitude === "number" ? coords.altitude : null;

        return {
            type: "Point",
            coordinates:
                altitude !== null
                    ? [coords.longitude, coords.latitude, altitude]
                    : [coords.longitude, coords.latitude],
        };
    }

    static generateProperties(geoLocation, heading) {
        if (!geoLocation.coords) return { heading: null };

        const { coords } = geoLocation;
        const altitude =
            typeof coords.altitude === "number" ? coords.altitude : null;

        const effectiveHeading =
            typeof heading === "number" && !isNaN(heading) ? heading : null;

        // heading is also exposed top-level so MapLibre expressions
        // (icon-image, icon-rotate) can reference it via ['get', 'heading']
        return {
            heading: effectiveHeading,
            ogisNav: {
                heading: effectiveHeading,
                speed: coords.speed,
                altitude,
                accuracy: coords.accuracy,
                altitudeAccuracy: coords.altitudeAccuracy,
                timestamp: geoLocation.timestamp,
            },
        };
    }
}


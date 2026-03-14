import { WaymarkMarker } from "@ogis/waymark-js";
import { getColour } from "@/helpers/Identity";

export default class Position extends WaymarkMarker {
    // https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
    constructor(geoLocation = {}, heading = null, feature = {}) {
        // Generate properties first so they are available for the super constructor
        const initialProperties = Position.generateProperties(
            geoLocation,
            heading,
        );
        const initialGeometry = Position.generateGeometry(geoLocation);

        // Merge generated properties into the feature object
        feature.properties = {
            ...feature.properties,
            ...initialProperties,
        };
        feature.geometry = initialGeometry;

        super(feature);
    }

    update(geoLocation = {}, heading = null) {
        const properties = Position.generateProperties(geoLocation, heading);
        const geometry = Position.generateGeometry(geoLocation);

        this.properties = { ...this.properties, ...properties };
        this.geometry = geometry;
    }

    static generateGeometry(geoLocation) {
        if (
            !geoLocation.coords ||
            typeof geoLocation.coords.longitude !== "number" ||
            typeof geoLocation.coords.latitude !== "number"
        ) {
            // Return null or handle error appropriate for your app flow
            // Returning empty coordinates to avoid crash, or could throw error
            return {
                type: "Point",
                coordinates: [0, 0, 0],
            };
        }

        const coords = geoLocation.coords;
        const altitude =
            typeof coords.altitude === "number" ? coords.altitude : null;

        return {
            type: "Point",
            coordinates: [coords.longitude, coords.latitude, altitude],
        };
    }

    static generateProperties(geoLocation, heading) {
        if (!geoLocation.coords) return {};

        const coords = geoLocation.coords;
        const altitude =
            typeof coords.altitude === "number" ? coords.altitude : null;

        const ogisNav = {
            heading: heading,
            speed: coords.speed,
            altitude: altitude,
            accuracy: coords.accuracy,
            altitudeAccuracy: coords.altitudeAccuracy,
            timestamp: geoLocation.timestamp,
        };

        // Icon logic
        const rotation =
            typeof heading === "number" && !isNaN(heading) ? heading : null;

        const iconHTML = rotation
            ? `<svg class="oi" width="40" height="40" fill="${getColour("primary")}" style="display: inline-block; transform: rotate(${rotation}deg);"><use xlink:href="/static/icons/ogisNav-icons.svg#position-heading" /></svg>`
            : `<svg class="oi" width="40" height="40" fill="${getColour("primary")}" style="display: inline-block;"><use xlink:href="/static/icons/ogisNav-icons.svg#position" /></svg>`;

        return {
            ogisNav: ogisNav,
            waymark: {
                icon: {
                    html: iconHTML,
                    width: 48,
                    height: 48,
                },
                paint: {
                    "circle-radius": 0,
                    "circle-color": "transparent",
                    "circle-stroke-color": "transparent",
                    "circle-stroke-width": 0,
                },
            },
        };
    }
}

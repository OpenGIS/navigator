<script setup>
import { computed } from "vue";
import { useLocate } from "@/features/locate/useLocate";
import { useSettings } from "@/features/settings/useSettings";

const { mode, position, compassHeading } = useLocate();
const { isMetric } = useSettings();

const formattedCoords = computed(() => {
    if (!position.value) return null;
    const { lat, lng } = position.value;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
});

const formattedAccuracy = computed(() => {
    if (!position.value) return null;
    if (isMetric.value) return `${Math.round(position.value.accuracy)} m`;
    return `${Math.round(position.value.accuracy * 3.28084)} ft`;
});

const formattedSpeed = computed(() => {
    if (!position.value || position.value.speed === null) return null;
    if (isMetric.value) return `${(position.value.speed * 3.6).toFixed(1)} km/h`;
    return `${(position.value.speed * 2.23694).toFixed(1)} mph`;
});

const formattedHeading = computed(() => {
    if (compassHeading.value === null) return null;
    return `${compassHeading.value}°`;
});
</script>

<template>
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
        <h5 class="mb-0">Your location</h5>
    </div>

    <div v-if="mode === null" class="sidebar-section sidebar-section-body p-3 border-top">
        <p class="mb-0 text-body-secondary small">
            Press the Locate button to show your position on the map.
        </p>
    </div>

    <div v-if="mode === 'error'" class="sidebar-section sidebar-section-body p-3 border-top">
        <p class="mb-0 text-danger small">
            Location access was denied. Press the Locate button for instructions
            on how to re-enable it.
        </p>
    </div>

    <div
        v-if="position"
        class="sidebar-section sidebar-section-body p-3 border-top"
    >
        <h6 class="mb-2 text-muted small text-uppercase fw-semibold">
            Position
        </h6>

        <p class="mb-1 small">
            <span class="text-body-secondary">Lat/Lng</span>
            <span class="ms-2 font-monospace">{{ formattedCoords }}</span>
        </p>

        <p class="mb-1 small">
            <span class="text-body-secondary">Accuracy</span>
            <span class="ms-2 font-monospace">{{ formattedAccuracy }}</span>
        </p>

        <p v-if="formattedSpeed" class="mb-1 small">
            <span class="text-body-secondary">Speed</span>
            <span class="ms-2 font-monospace">{{ formattedSpeed }}</span>
        </p>

        <p v-if="formattedHeading" class="mb-1 small">
            <span class="text-body-secondary">Heading</span>
            <span class="ms-2 font-monospace">{{ formattedHeading }}</span>
        </p>
    </div>

    <div
        v-if="mode === 'following'"
        class="sidebar-section sidebar-section-body p-3 border-top"
    >
        <p class="mb-0 text-body-secondary small">
            The map is following your position. Press the Locate button again to
            stop.
        </p>
    </div>
</template>

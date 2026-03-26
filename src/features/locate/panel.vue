<script setup>
import { computed } from "vue";
import { useLocate } from "@/features/locate/useLocate";
import { useSettings } from "@/features/settings/useSettings";
import { useLocale } from "@/core/useLocale";

const { mode, position, compassHeading } = useLocate();
const { isMetric } = useSettings();
const { t } = useLocale();

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
        <h5 class="mb-0">{{ t('locate.title') }}</h5>
    </div>

    <div v-if="mode === null" class="sidebar-section sidebar-section-body p-3 border-top">
        <p class="mb-0 text-body-secondary small">
            {{ t('locate.pressLocate') }}
        </p>
    </div>

    <div v-if="mode === 'error'" class="sidebar-section sidebar-section-body p-3 border-top">
        <p class="mb-0 text-danger small">
            {{ t('locate.accessDenied') }}
        </p>
    </div>

    <div
        v-if="position"
        class="sidebar-section sidebar-section-body p-3 border-top"
    >
        <h6 class="mb-2 text-muted small text-uppercase fw-semibold">
            {{ t('locate.position') }}
        </h6>

        <p class="mb-1 small">
            <span class="text-body-secondary">{{ t('locate.latLng') }}</span>
            <span class="ms-2 font-monospace">{{ formattedCoords }}</span>
        </p>

        <p class="mb-1 small">
            <span class="text-body-secondary">{{ t('locate.accuracy') }}</span>
            <span class="ms-2 font-monospace">{{ formattedAccuracy }}</span>
        </p>

        <p v-if="formattedSpeed" class="mb-1 small">
            <span class="text-body-secondary">{{ t('locate.speed') }}</span>
            <span class="ms-2 font-monospace">{{ formattedSpeed }}</span>
        </p>

        <p v-if="formattedHeading" class="mb-1 small">
            <span class="text-body-secondary">{{ t('locate.heading') }}</span>
            <span class="ms-2 font-monospace">{{ formattedHeading }}</span>
        </p>
    </div>

    <div
        v-if="mode === 'following'"
        class="sidebar-section sidebar-section-body p-3 border-top"
    >
        <p class="mb-0 text-body-secondary small">
            {{ t('locate.following') }}
        </p>
    </div>
</template>

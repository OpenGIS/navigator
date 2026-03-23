<script setup>
import { computed } from "vue";
import { useMap } from "@/core/useMap";
import Icon from "@/components/ui/icon.vue";

const { currentView } = useMap();

const formattedCoords = computed(() => {
  if (!currentView.value) return null;
  const { lat, lng } = currentView.value;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
});

const formattedZoom = computed(() =>
  currentView.value ? Math.round(currentView.value.zoom) : null,
);

const shareUrl = computed(() => {
  if (!currentView.value) return window.location.href;
  const { lat, lng, zoom } = currentView.value;
  const hash = `#map=${Math.round(zoom)}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
  return `${window.location.origin}${window.location.pathname}${hash}`;
});
</script>

<template>
  <div class="sidebar-section sidebar-section-body p-3 pb-0">
    <h5 class="mb-0">Navigator</h5>
  </div>

  <div v-if="currentView" class="sidebar-section sidebar-section-body p-3 border-top">
    <h6 class="mb-2 text-muted small text-uppercase fw-semibold">Current view</h6>
    <p class="mb-1 small">
      <span class="text-body-secondary">Lat/Lng</span>
      <span class="ms-2 font-monospace">{{ formattedCoords }}</span>
    </p>
    <p class="mb-2 small">
      <span class="text-body-secondary">Zoom</span>
      <span class="ms-2 font-monospace">{{ formattedZoom }}</span>
    </p>
    <a
      :href="shareUrl"
      target="_blank"
      rel="noopener"
      class="navigator-share-link btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-1"
    >
      <Icon width="16" height="16" fill="currentColor" name="globe" />
      Share this view
    </a>
  </div>

  <div class="sidebar-section sidebar-section-body p-3 border-top mt-auto">
    <p class="mb-2">
      An open source mapping application built with MapLibre GL JS and Vue 3.
    </p>
    <p class="mb-0">Thanks <em>Open Source</em>!</p>
  </div>

  <div class="sidebar-section sidebar-section-body p-3 border-top">
    <h6 class="mb-3 w-100 d-flex align-items-center">
      Attribution

      <Icon
        class="ms-auto text-danger"
        width="32"
        height="32"
        fill="currentColor"
        name="heart"
      />
    </h6>

    <div class="d-flex flex-column gap-3">
      <!-- MapLibre -->
      <div class="d-flex align-items-center">
        <span
          class="badge bg-warning bg-opacity-10 text-warning rounded-pill me-2"
          >Rendering</span
        >
        <a
          href="https://maplibre.org/"
          target="_blank"
          class="text-body small ms-auto text-decoration-underline"
        >
          MapLibre GL JS
        </a>
      </div>

      <!-- OpenFreeMap -->
      <div class="d-flex align-items-center">
        <span
          class="badge bg-primary bg-opacity-10 text-primary rounded-pill me-2"
          >Vector Tiles</span
        >
        <a
          href="https://openfreemap.org"
          target="_blank"
          class="text-body small ms-auto text-decoration-underline"
        >
          OpenFreeMap
        </a>
      </div>

      <!-- OpenMapTiles -->
      <div class="d-flex align-items-center">
        <span class="badge bg-info bg-opacity-10 text-info rounded-pill me-2"
          >Tile Schema</span
        >
        <a
          href="https://www.openmaptiles.org/"
          target="_blank"
          class="text-body small ms-auto text-decoration-underline"
        >
          &copy; OpenMapTiles
        </a>
      </div>

      <!-- OpenStreetMap -->
      <div class="d-flex align-items-center">
        <span
          class="badge bg-danger bg-opacity-10 text-danger rounded-pill me-2"
          >Data</span
        >
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          class="text-body small ms-auto text-decoration-underline"
        >
          &copy; OpenStreetMap contributors
        </a>
      </div>
    </div>
  </div>
</template>

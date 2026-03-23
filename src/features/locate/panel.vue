<script setup>
import { computed } from "vue";
import { usePosition } from "@/features/locate/usePosition";
import Icon from "@/components/ui/icon.vue";

// State
const { currentPosition } = usePosition();

const formatCoord = (val) =>
  val !== null && val !== undefined ? val.toFixed(6) : "—";

const formatSpeed = (val) =>
  val !== null && val !== undefined ? (val * 3.6).toFixed(1) + " km/h" : "—";

const formatAltitude = (val) =>
  val !== null && val !== undefined ? Math.round(val) + " m" : "—";

const getCardinal = (angle) => {
  if (angle === null || angle === undefined) return "—";
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 22.5);
  return directions[index % 16];
};

const formatHeading = (val) =>
  val !== null && val !== undefined ? Math.round(val) + "°" : "—";
</script>

<template>
  <div class="sidebar-section sidebar-section-body p-3 pb-0">
    <h5 class="mb-0">Current Location</h5>
  </div>

  <div class="sidebar-section sidebar-section-body p-3">
    <div v-if="currentPosition && currentPosition.properties.ogisNav">
      <!-- Location Cards -->
      <div class="row g-3">
        <!-- Latitude -->
        <div class="col-6">
          <div class="card card-body mb-0 p-3 h-100 border-primary-subtle">
            <div class="d-flex align-items-center mb-1">
              <i class="oi oi-globe text-primary me-2"></i>
              <span class="text-muted small text-uppercase">Lat</span>
            </div>
            <div class="fw-semibold text-end">
              {{ formatCoord(currentPosition.geometry.coordinates[1]) }}
            </div>
          </div>
        </div>

        <!-- Longitude -->
        <div class="col-6">
          <div class="card card-body mb-0 p-3 h-100 border-primary-subtle">
            <div class="d-flex align-items-center mb-1">
              <i class="oi oi-globe text-primary me-2"></i>
              <span class="text-muted small text-uppercase">Lng</span>
            </div>
            <div class="fw-semibold text-end">
              {{ formatCoord(currentPosition.geometry.coordinates[0]) }}
            </div>
          </div>
        </div>

        <!-- Heading -->
        <div
          class="col-12"
          v-if="currentPosition.properties.ogisNav.heading !== null"
        >
          <div class="card card-body mb-0 p-3 ps-0 border-warning-subtle">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center">
                <!-- <i class="oi oi-position-heading text-warning me-2"></i> -->

                <Icon
                  class="text-warning"
                  width="34"
                  height="34"
                  fill="currentColor"
                  name="position-heading"
                />

                <span class="text-muted small text-uppercase">Heading</span>
              </div>
              <div class="text-end">
                <span class="fw-bold me-2">{{
                  getCardinal(currentPosition.properties.ogisNav.heading)
                }}</span>
                <span class="text-muted small">{{
                  formatHeading(currentPosition.properties.ogisNav.heading)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Speed -->
        <div
          class="col-6"
          v-if="currentPosition.properties.ogisNav.speed !== null"
        >
          <div class="card card-body mb-0 p-3 h-100 border-success-subtle">
            <div class="d-flex align-items-center mb-1">
              <i class="oi oi-speedometer2 text-success me-2"></i>
              <span class="text-muted small text-uppercase">Speed</span>
            </div>
            <div class="fw-semibold text-end">
              {{ formatSpeed(currentPosition.properties.ogisNav.speed) }}
            </div>
          </div>
        </div>

        <!-- Altitude -->
        <div
          class="col-6"
          v-if="currentPosition.properties.ogisNav.altitude !== null"
        >
          <div class="card card-body mb-0 p-3 h-100 border-info-subtle">
            <div class="d-flex align-items-center mb-1">
              <i class="oi oi-graph-down text-info me-2"></i>
              <span class="text-muted small text-uppercase">Alt</span>
            </div>
            <div class="fw-semibold text-end">
              {{ formatAltitude(currentPosition.properties.ogisNav.altitude) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-muted text-center py-3">
      <i class="ph-map-pin mb-2 fs-2 d-block"></i>
      Location unavailable.<br />Press the
      <Icon
        class="ms-auto"
        width="32"
        height="32"
        fill="currentColor"
        name="position"
      />
      button to enable location tracking.
    </div>
  </div>

  <div class="sidebar-section sidebar-section-body p-3 border-top mt-auto">
    <p class="mb-2">
      Use your device location and compass to see where you are, anywhere in the
      world.
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

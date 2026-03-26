<script setup>
import { computed, ref } from "vue";
import { useMap } from "@/core/useMap";
import { useUI } from "@/core/useUI";
import { useLocate } from "@/features/locate/useLocate";
import { useLocale } from "@/core/useLocale";
import Icon from "@/components/ui/icon.vue";
import IconButton from "@/components/ui/icon-button.vue";
import PanelBar from "@/components/ui/side/panel-bar.vue";
import SettingsPanel from "@/features/settings/panel.vue";

const { currentView } = useMap();
const { togglePanel, openAboutModal } = useUI();
const { mode: locateMode, headingLost, position, permissionGranted, retryOrientation, retryPosition } = useLocate();
const { t } = useLocale();

const sharePosition = ref(false);

const formattedCoords = computed(() => {
  if (!currentView.value) return null;
  const { lat, lng } = currentView.value;
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
});

const formattedZoom = computed(() =>
  currentView.value ? Math.round(currentView.value.zoom) : null,
);

const shareUrl = computed(() => {
  const zoom = currentView.value ? Math.round(currentView.value.zoom) : 0;
  const base = `${window.location.origin}${window.location.pathname}`;

  if (sharePosition.value && position.value) {
    const { lat, lng } = position.value;
    const hash = `#map=${zoom}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
    return `${base}${hash}`;
  }

  if (!currentView.value) return window.location.href;
  const { lat, lng } = currentView.value;
  const hash = `#map=${zoom}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
  return `${base}${hash}`;
});
</script>

<template>
  <div class="d-flex flex-column flex-grow-1">
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
      <h5 class="mb-0">{{ t('menu.title') }}</h5>
    </div>

    <div v-if="currentView" class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('menu.currentView') }}</h6>
      <p class="mb-1 small">
        <span class="text-body-secondary">{{ t('menu.latLng') }}</span>
        <span class="ms-2 font-monospace">{{ formattedCoords }}</span>
      </p>
      <p class="mb-2 small">
        <span class="text-body-secondary">{{ t('menu.zoom') }}</span>
        <span class="ms-2 font-monospace">{{ formattedZoom }}</span>
      </p>
      <div v-if="permissionGranted" class="form-check mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="share-position-toggle"
          v-model="sharePosition"
          :disabled="!position"
        />
        <label class="form-check-label small" for="share-position-toggle">
          {{ t('menu.shareMyPosition') }}
          <span v-if="!position" class="text-body-tertiary"> {{ t('menu.positionNotActive') }}</span>
        </label>
      </div>
      <a
        :href="shareUrl"
        target="_blank"
        rel="noopener"
        class="navigator-share-link btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-1"
      >
        <Icon width="16" height="16" fill="currentColor" name="globe" />
        {{ sharePosition && position ? t('menu.shareMyPosition') : t('menu.shareThisView') }}
      </a>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top mt-auto">
      <p class="mb-2">{{ t('menu.description') }}</p>
      <p class="mb-0">{{ t('menu.thankOpenSource') }}</p>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-3 w-100 d-flex align-items-center">
        {{ t('menu.attribution') }}

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
          <span class="badge bg-warning bg-opacity-10 text-warning rounded-pill me-2">Rendering</span>
          <a href="https://maplibre.org/" target="_blank" class="text-body small ms-auto text-decoration-underline">
            MapLibre GL JS
          </a>
        </div>

        <!-- OpenFreeMap -->
        <div class="d-flex align-items-center">
          <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill me-2">Vector Tiles</span>
          <a href="https://openfreemap.org" target="_blank" class="text-body small ms-auto text-decoration-underline">
            OpenFreeMap
          </a>
        </div>

        <!-- OpenMapTiles -->
        <div class="d-flex align-items-center">
          <span class="badge bg-info bg-opacity-10 text-info rounded-pill me-2">Tile Schema</span>
          <a href="https://www.openmaptiles.org/" target="_blank" class="text-body small ms-auto text-decoration-underline">
            &copy; OpenMapTiles
          </a>
        </div>

        <!-- OpenStreetMap -->
        <div class="d-flex align-items-center">
          <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill me-2">Data</span>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" class="text-body small ms-auto text-decoration-underline">
            &copy; OpenStreetMap contributors
          </a>
        </div>
      </div>
    </div>

    <div v-if="locateMode === 'error'"
      class="sidebar-section sidebar-section-body p-3 border-top"
      id="menu-position-lost-alert"
    >
      <div class="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-0 small" role="alert">
        <span>{{ t('menu.locationLost') }}</span>
        <button
          type="button"
          class="btn btn-sm btn-danger ms-auto py-0"
          @click="retryPosition"
        >{{ t('menu.reRequest') }}</button>
      </div>
    </div>

    <div v-if="headingLost && (locateMode === 'active' || locateMode === 'following')"
      class="sidebar-section sidebar-section-body p-3 border-top"
      id="menu-heading-lost-alert"
    >
      <div class="alert alert-warning d-flex align-items-center gap-2 py-2 px-3 mb-0 small" role="alert">
        <span>{{ t('menu.compassUnavailable') }}</span>
        <button
          type="button"
          class="btn btn-sm btn-warning ms-auto py-0"
          @click="retryOrientation"
        >{{ t('menu.reRequest') }}</button>
      </div>
    </div>

    <PanelBar>
      <IconButton
        icon="gear"
        :label="t('menu.settings')"
        :icon-width="32"
        :icon-height="32"
        @click="togglePanel('settings', SettingsPanel)"
      />
      <IconButton
        id="about-button"
        icon="info-circle"
        :label="t('menu.about')"
        :icon-width="32"
        :icon-height="32"
        @click="openAboutModal"
      />
    </PanelBar>
  </div>
</template>


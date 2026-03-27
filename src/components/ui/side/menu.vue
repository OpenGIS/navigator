<script setup>
import { computed, ref } from "vue";
import { useMap } from "@/composables/useMap";
import { useUI } from "@/composables/useUI";
import { useLocate } from "@/composables/useLocate";
import { useSettings } from "@/composables/useSettings";
import { useLocale } from "@/composables/useLocale";
import Icon from "@/components/ui/icon.vue";
import IconButton from "@/components/ui/icon-button.vue";
import SettingsPanel from "@/components/panels/settings.vue";
import AboutPanel from "@/components/panels/about.vue";
import PrivacyPanel from "@/components/panels/privacy.vue";

const { currentView } = useMap();
const { activeMenuSub, setMenuSub } = useUI();
const { mode: locateMode, headingLost, position, compassHeading, permissionGranted, retryOrientation, retryPosition } = useLocate();
const { isMetric } = useSettings();
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

const formattedPositionCoords = computed(() => {
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

const tabs = [
  { id: 'location', icon: 'globe', labelKey: 'menu.location' },
  { id: 'settings', icon: 'gear', labelKey: 'menu.settings', btnId: 'settings-button' },
  { id: 'about', icon: 'info-circle', labelKey: 'menu.about', btnId: 'about-button' },
  { id: 'privacy', icon: 'lock', labelKey: 'menu.privacy', btnId: 'privacy-button' },
];
</script>

<template>
  <div class="d-flex flex-column flex-grow-1">
    <!-- Top navigation -->
    <div class="menu-nav border-bottom bg-body">
      <IconButton
        v-for="tab in tabs"
        :key="tab.id"
        :id="tab.btnId"
        :icon="tab.icon"
        :label="t(tab.labelKey)"
        :icon-width="32"
        :icon-height="32"
        :active="activeMenuSub === tab.id"
        @click="setMenuSub(tab.id)"
      />
    </div>

    <!-- Sub-panel content -->
    <div class="menu-content flex-grow-1 overflow-auto">

      <!-- Location -->
      <template v-if="activeMenuSub === 'location'">

        <!-- Current map view + share -->
        <div v-if="currentView" class="sidebar-section sidebar-section-body p-3 border-bottom">
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

        <!-- Locate prompt when not yet active -->
        <div v-if="locateMode === null" class="sidebar-section sidebar-section-body p-3 border-bottom">
          <p class="mb-0 text-body-secondary small">{{ t('locate.pressLocate') }}</p>
        </div>

        <!-- Location error -->
        <div v-if="locateMode === 'error'" class="sidebar-section sidebar-section-body p-3 border-bottom" id="menu-position-lost-alert">
          <div class="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-0 small" role="alert">
            <span>{{ t('menu.locationLost') }}</span>
            <button type="button" class="btn btn-sm btn-danger ms-auto py-0" @click="retryPosition">{{ t('menu.reRequest') }}</button>
          </div>
        </div>

        <!-- Device position details -->
        <div v-if="position" class="sidebar-section sidebar-section-body p-3 border-bottom">
          <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('locate.position') }}</h6>
          <p class="mb-1 small">
            <span class="text-body-secondary">{{ t('locate.latLng') }}</span>
            <span class="ms-2 font-monospace">{{ formattedPositionCoords }}</span>
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

        <!-- Compass warning -->
        <div
          v-if="headingLost && (locateMode === 'active' || locateMode === 'following')"
          class="sidebar-section sidebar-section-body p-3 border-bottom"
          id="menu-heading-lost-alert"
        >
          <div class="alert alert-warning d-flex align-items-center gap-2 py-2 px-3 mb-0 small" role="alert">
            <span>{{ t('menu.compassUnavailable') }}</span>
            <button type="button" class="btn btn-sm btn-warning ms-auto py-0" @click="retryOrientation">{{ t('menu.reRequest') }}</button>
          </div>
        </div>
      </template>

      <!-- Settings -->
      <SettingsPanel v-else-if="activeMenuSub === 'settings'" />

      <!-- About -->
      <AboutPanel v-else-if="activeMenuSub === 'about'" />

      <!-- Privacy -->
      <PrivacyPanel v-else-if="activeMenuSub === 'privacy'" />
    </div>
  </div>
</template>

<style scoped>
.menu-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 5rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.menu-nav :deep(.icon-btn) {
  flex: 1 0 calc(100% / 4);
}
</style>

<script setup>
import { useLocale } from "@/composables/useLocale";

const { t } = useLocale();
</script>

<template>
  <div class="navigator-privacy-panel d-flex flex-column flex-grow-1">
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
      <h5 class="mb-0">{{ t('privacy.title') }}</h5>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('privacy.onDevice') }}</h6>
      <p class="mb-2 small">{{ t('privacy.onDeviceBody') }}</p>
      <ul class="mb-0 small ps-3">
        <li class="mb-1">{{ t('privacy.mapView') }}</li>
        <li>{{ t('privacy.settings') }}</li>
      </ul>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('privacy.thirdParty') }}</h6>
      <p class="mb-0 small">{{ t('privacy.thirdPartyBody') }}</p>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('privacy.location') }}</h6>
      <p class="mb-0 small">{{ t('privacy.locationBody') }}</p>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-2 text-muted small text-uppercase fw-semibold">{{ t('privacy.noTracking') }}</h6>
      <p class="mb-0 small">{{ t('privacy.noTrackingBody') }}</p>
    </div>
  </div>
</template>

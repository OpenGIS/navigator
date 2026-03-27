<script setup>
import { computed } from "vue";
import { useUI } from "@/composables/useUI";
import { useLocale } from "@/composables/useLocale";
import IconButton from "@/components/ui/icon-button.vue";
import ViewPanel from "@/components/panels/view.vue";
import SettingsPanel from "@/components/panels/settings.vue";
import AboutPanel from "@/components/panels/about.vue";
import PrivacyPanel from "@/components/panels/privacy.vue";

const { isPanelVisible, activePanel, setActivePanel, closePanel, isDesktop } = useUI();
const { t } = useLocale();

const tabs = [
  { id: "view",     icon: "globe",        labelKey: "menu.mapView" },
  { id: "settings", icon: "gear",         labelKey: "menu.settings",   btnId: "settings-button" },
  { id: "about",    icon: "info-circle",  labelKey: "menu.about",      btnId: "about-button" },
  { id: "privacy",  icon: "lock",         labelKey: "menu.privacy",    btnId: "privacy-button" },
];

const panelComponents = {
  view:     ViewPanel,
  settings: SettingsPanel,
  about:    AboutPanel,
  privacy:  PrivacyPanel,
};

const activeComponent = computed(() => panelComponents[activePanel.value] ?? ViewPanel);
</script>

<template>
  <div
    class="offcanvas offcanvas-start navigator-panel"
    :class="{ show: isPanelVisible }"
    tabindex="-1"
    aria-labelledby="offcanvasLabel"
    data-bs-scroll="true"
    data-bs-backdrop="false"
  >
    <div class="offcanvas-body p-0 d-flex flex-column">
      <!-- Panel Nav -->
      <div class="panel-nav border-bottom bg-body">
        <IconButton
          v-for="tab in tabs"
          :key="tab.id"
          :id="tab.btnId"
          :icon="tab.icon"
          :label="t(tab.labelKey)"
          :icon-width="32"
          :icon-height="32"
          :active="activePanel === tab.id"
          @click="setActivePanel(tab.id)"
        />
      </div>

      <!-- Active Panel Content -->
      <div class="flex-grow-1 overflow-auto">
        <component :is="activeComponent" />
      </div>
    </div>
  </div>

  <!-- Backdrop for mobile -->
  <div
    v-if="isPanelVisible && !isDesktop"
    class="offcanvas-backdrop fade show"
    @click="closePanel()"
  ></div>
</template>

<style scoped>
.offcanvas {
  z-index: 1045;
  top: 86px !important;
  height: calc(100% - 73px) !important;
}

.panel-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 5rem;
  position: sticky;
  top: 0;
  z-index: 1;
}

.panel-nav :deep(.icon-btn) {
  flex: 1 0 calc(100% / 4);
}
</style>

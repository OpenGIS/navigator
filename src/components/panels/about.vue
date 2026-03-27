<script setup>
import { useLocale } from "@/composables/useLocale";
import Icon from "@/components/ui/icon.vue";

const { t } = useLocale();
</script>

<template>
  <div class="navigator-about-panel d-flex flex-column flex-grow-1">
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
      <h5 class="mb-0">{{ t("panel.about.title") }}</h5>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <a
        href="https://www.ogis.org/"
        target="_blank"
        rel="noopener"
        class="ogis-logo"
      >
        <svg width="48" height="48" fill="#fff" aria-hidden="true">
          <use href="@ogis/icons/dist/ogis-icons.svg#ogis-logo"></use>
        </svg>
      </a>

      <p class="lead">{{ t("panel.about.descriptionOne") }}</p>

      <p>{{ t("panel.about.descriptionTwo") }}</p>

      <p>{{ t("panel.about.descriptionThree") }}</p>

      <p>
        {{ t("panel.about.by") }} <a href="https://www.ogis.org/">Open GIS</a>
        {{ t("panel.about.on") }}
        <a href="https://github.com/OpenGIS/navigator">GitHub</a>.
      </p>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
      <h6 class="mb-3 w-100 d-flex align-items-center">
        {{ t("panel.about.thanksOpenSource") }}
        <Icon
          class="ms-auto text-danger"
          width="32"
          height="32"
          fill="currentColor"
          name="heart"
        />
      </h6>

      <div class="d-flex flex-column gap-3">
        <div class="d-flex align-items-center">
          <span
            class="badge bg-danger bg-opacity-10 text-danger rounded-pill me-2"
            >{{ t("panel.about.mapData") }}</span
          >
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener"
            class="text-body text-end small ms-auto text-decoration-underline"
          >
            &copy; OpenStreetMap contributors
          </a>
        </div>

        <div class="d-flex align-items-center">
          <span
            class="badge bg-primary bg-opacity-10 text-primary rounded-pill me-2"
            >{{ t("panel.about.tileHosting") }}</span
          >
          <a
            href="https://openfreemap.org"
            target="_blank"
            rel="noopener"
            class="text-body text-end small ms-auto text-decoration-underline"
          >
            OpenFreeMap
          </a>
        </div>

        <div class="d-flex align-items-center">
          <span
            class="badge bg-warning bg-opacity-10 text-warning rounded-pill me-2"
            >{{ t("panel.about.rendering") }}</span
          >
          <a
            href="https://maplibre.org/"
            target="_blank"
            rel="noopener"
            class="text-body text-end small ms-auto text-decoration-underline"
          >
            MapLibre GL JS
          </a>
        </div>

        <div class="d-flex align-items-center">
          <span
            class="badge bg-info bg-opacity-10 text-info rounded-pill me-2"
            >{{ t("panel.about.tileSchema") }}</span
          >
          <a
            href="https://www.openmaptiles.org/"
            target="_blank"
            rel="noopener"
            class="text-body text-end small ms-auto text-decoration-underline"
          >
            OpenMapTiles</a
          >
          &nbsp;/&nbsp;
          <a
            href="https://github.com/openmaptiles/osm-bright-gl-style"
            target="_blank"
            rel="noopener"
            class="text-body text-end small text-decoration-underline"
            >OSM Bright</a
          >
        </div>

        <div class="d-flex align-items-center">
          <span
            class="badge bg-success bg-opacity-10 text-success rounded-pill me-2"
            >{{ t("panel.about.userInterface") }}</span
          >
          <span class="ms-auto small">
            <a
              href="https://vuejs.org/"
              target="_blank"
              rel="noopener"
              class="text-body text-end text-decoration-underline"
              >Vue JS</a
            >
            &nbsp;/&nbsp;
            <a
              href="https://getbootstrap.com/"
              target="_blank"
              rel="noopener"
              class="text-body text-end text-decoration-underline"
              >Bootstrap</a
            >
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ogis-logo {
  padding: 3px;
  margin-left: 10px;
  float: right;
  line-height: 1;
  background: #002400;
}
</style>

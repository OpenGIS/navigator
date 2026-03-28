<script setup>
import About from "@/components/modals/welcome.vue";
import { useUI } from "@/composables/useUI";
import { useLocale } from "@/composables/useLocale";
import IconButton from "@/components/ui/icon-button.vue";
import LocateButton from "@/components/ui/top/locate.vue";

const { togglePanel } = useUI();
const { t } = useLocale();
</script>

<template>
  <!-- START Top Nav -->
  <nav class="navbar bg-body" data-bs-theme="dark">
    <div class="container-fluid">
      <!-- START Start -->
      <div class="start position-relative">
        <IconButton
          icon="layout-sidebar-inset"
          :label="t('nav.menu')"
          :icon-width="40"
          :icon-height="40"
          class="navbar-toggler position-relative"
          @click="togglePanel()"
        />
      </div>
      <!-- END Start -->

      <!-- START Middle -->
      <ul class="middle nav">
        <li class="nav-item ms-1"></li>
      </ul>
      <!-- END Middle -->

      <!-- START End -->
      <ul class="end nav">
        <li class="nav-item mx-1">
          <LocateButton />
        </li>
      </ul>
      <!-- END End -->
    </div>
  </nav>
  <!-- END Top Nav -->

  <About />
</template>



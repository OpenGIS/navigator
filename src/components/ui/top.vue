<script setup>
import Alerts from "@/components/ui/top/alerts.vue";
import MenuPanel from "@/components/ui/side/menu.vue";
import { useUI } from "@/core/useUI";
import { useLocate } from "@/features/locate/useLocate";
import Icon from "@/components/ui/icon.vue";
import LocateButton from "@/features/locate/button.vue";

const { togglePanel } = useUI();
const { hasAlerts } = useLocate();
</script>

<template>
  <!-- START Top Nav -->
  <nav class="navbar bg-body" data-bs-theme="dark">
    <div class="container-fluid">
      <!-- START Start -->
      <div class="start">
        <button
          type="button"
          class="navbar-toggler border-0 position-relative"
          @click="togglePanel('menu', MenuPanel)"
        >
          <Icon width="48" height="48" fill="currentColor" name="sidebar-info" />
          <span
            v-if="hasAlerts"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger navigator-alert-badge"
            aria-live="polite"
          >!<span class="visually-hidden">menu has alerts</span></span>
        </button>
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

  <Alerts />
</template>

<style scoped>
.navbar-toggler:focus {
  box-shadow: none;
  border: 0;
  outline: none;
}

.navigator-alert-badge {
  font-size: 0.6rem;
  min-width: 1.1rem;
  padding: 0.2rem 0.3rem;
  line-height: 1;
}
</style>

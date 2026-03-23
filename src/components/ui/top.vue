<script setup>
import Alerts from "@/components/ui/top/alerts.vue";
import MenuPanel from "@/components/ui/side/menu.vue";
import { useUI } from "@/core/useUI";
import Icon from "@/components/ui/icon.vue";

const { togglePanel } = useUI();
</script>

<template>
  <!-- START Top Nav -->
  <nav class="navbar navbar-dark bg-primary">
    <div class="container-fluid">
      <!-- START Start -->
      <div class="start">
        <button
          type="button"
          class="navbar-toggler border-0"
          @click="togglePanel('menu', MenuPanel)"
        >
          <Icon width="48" height="48" fill="currentColor" name="sidebar-info" />
        </button>
      </div>
      <!-- END Start -->

      <!-- START Middle -->
      <ul class="middle nav">
        <li class="nav-item ms-1"></li>
      </ul>
      <!-- END Middle -->

      <!-- START End -->
      <ul class="end nav"></ul>
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
</style>

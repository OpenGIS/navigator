<script setup>
import Position from "@/components/ui/top/position.vue";
import LocatePanel from "@/features/locate/panel.vue";
import { useUI } from "@/core/useUI";
import Icon from "@/components/ui/icon.vue";
// import { usePosition } from "@/features/locate/usePosition";

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
          @click="togglePanel('locate', LocatePanel)"
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
      <ul class="end nav">
        <li class="nav-item mx-1">
          <Position />
        </li>
      </ul>
      <!-- END End -->
    </div>
  </nav>
  <!-- END Top Nav -->
</template>

<style scoped>
.navbar-toggler:focus {
  box-shadow: none;
  border: 0;
  outline: none;
}
</style>

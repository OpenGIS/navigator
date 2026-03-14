<script setup>
import { getColour } from "@/helpers/Identity";
import { computed } from "vue";
import { usePosition } from "@/features/locate/usePosition";
import Icon from "@/components/ui/icon.vue";

const { positionMode, cyclePositionMode } = usePosition();

const iconName = computed(() => {
  return positionMode.value === "follow" ? "position-lock" : "position";
});

const iconColor = computed(() => {
  return positionMode.value ? getColour("primary") : "white";
});
</script>

<template>
  <!-- START Locate Button -->
  <a
    href="#"
    class="navbar-nav-link navbar-nav-link-icon rounded-pill"
    :class="{ active: positionMode }"
    id="locate-button"
    @click="cyclePositionMode()"
  >
    <Icon class="oi" width="40" height="40" :fill="iconColor" :name="iconName" />
  </a>
  <!-- END Locate Button -->
</template>

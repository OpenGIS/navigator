<script setup>
import { useUI } from "@/core/useUI";

const { isFirstLoad, setFirstLoadComplete } = useUI();
</script>

<template>
  <div v-if="isFirstLoad" id="first-load-alert">
    <div class="alert alert-info alert-dismissible mb-0 rounded-0 d-flex align-items-center gap-2">
      <span>
        Welcome to Navigator! Use the <strong>menu</strong> to explore the app
        and navigate the map.
      </span>
      <button
        type="button"
        class="btn-close ms-auto flex-shrink-0"
        @click="setFirstLoadComplete()"
        aria-label="Dismiss"
      ></button>
    </div>
  </div>
</template>

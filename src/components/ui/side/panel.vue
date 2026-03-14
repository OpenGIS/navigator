<script setup>
import { ref } from "vue";
import { useUI } from "@/core/useUI";

const {
  activePanelId,
  activePanelComponent,
  closePanel,
  isPanelVisible,
  isDesktop,
} = useUI();

const panelRef = ref(null);
</script>

<template>
  <!-- START Panel (Bootstrap Offcanvas) -->
  <!-- Using .offcanvas-end for right-side panel -->
  <!-- Using :class="{ show: isPanelVisible }" to toggle visibility via Vue state -->
  <div
    class="offcanvas offcanvas-start"
    :class="{ show: isPanelVisible }"
    tabindex="-1"
    id="side-panel"
    ref="panelRef"
    aria-labelledby="offcanvasLabel"
    data-bs-scroll="true"
    data-bs-backdrop="false"
  >
    <div class="offcanvas-body p-0">
      <!-- Panel Content -->
      <component :is="activePanelComponent" v-if="activePanelComponent" />
    </div>
  </div>
  <!-- END Panel -->

  <!-- Optional Backdrop for mobile if desired. 
       If we want "sidebar" behavior (push content or overlay without backdrop), we can omit this.
       Bootstrap offcanvas with data-bs-backdrop="false" means no backdrop. 
       But we might want a backdrop on mobile. 
       Let's add it conditionally based on !isDesktop.
  -->
  <div
    v-if="isPanelVisible && !isDesktop"
    class="offcanvas-backdrop fade show"
    @click="closePanel()"
  ></div>
</template>

<style scoped>
/* Ensure the panel sits below navbar if needed */
.offcanvas {
  /* Adjust top and height if navbar is fixed-top. Assuming ~56px navbar */
  /* If navbar is not fixed, top: 0 is fine. But usually "sidebars" sit below. */
  /* Looking at App.vue, #top is position: absolute; top: 0; z-index: 2. */
  /* So panel needs high z-index. Bootstrap offcanvas is 1045. */
  z-index: 1045;
  top: 73px !important;
}

/* On desktop, we might want to push content or sit over it. 
   Offcanvas sits over content by default.
*/
</style>

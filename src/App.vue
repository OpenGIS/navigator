<script setup>
import { ref, inject } from "vue";
import iconSprite from "@/assets/icons/ogisNav-icons.svg?raw";

const props = defineProps({
	debug: { type: Boolean, default: false },
	mapOptions: { type: Object, default: () => ({}) },
});

// UI
import Top from "@/components/ui/top.vue";
import SidePanel from "@/components/ui/side/panel.vue";
import MenuPanel from "@/components/ui/side/menu.vue";

import { useMap } from "@/core/useMap";
import { useUI } from "@/core/useUI";

const instanceId = inject("navigatorId", "navigator");

// Map — template ref passed so useMap manages the full lifecycle
const mapContainer = ref(null);
useMap(mapContainer, props.mapOptions);

// UI Store
const {
	closeNav,
	openPanel,
	togglePanelExpanded,
	isNavVisible,
	isPanelVisible,
	isPanelExpanded,
	isDesktop,
	isMobile,
} = useUI();

const handleMapClick = () => {
	if (isNavVisible.value && !isDesktop.value) {
		closeNav();
	}

	// If Mobile Panel is visible and expanded, collapse it (minimize it)
	if (isMobile.value && isPanelVisible.value && isPanelExpanded.value) {
		togglePanelExpanded();
	}
};

if (isDesktop.value) {
	openPanel("menu", MenuPanel);
}
</script>

<template>
	<div style="display: none" v-html="iconSprite"></div>
	<div class="navigator-top">
		<Top />
	</div>

	<div class="navigator-content">
		<SidePanel />
	</div>

	<!-- Map -->
	<div
		ref="mapContainer"
		class="navigator-map"
		:data-navigator-id="instanceId"
		:class="{ 'panel-open': isPanelVisible && isDesktop }"
		@click="handleMapClick"
	/>
</template>

<style scoped>
.navigator-map {
	z-index: 1;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transition: left 0.3s ease, width 0.3s ease;
}

.navigator-map.panel-open {
	left: var(--bs-offcanvas-width, 400px);
	width: calc(100% - var(--bs-offcanvas-width, 400px));
}

.navigator-top {
	z-index: 1060;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}
</style>

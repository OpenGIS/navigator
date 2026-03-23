<script setup>
import { computed, ref } from "vue";
import iconSprite from "@/assets/icons/ogisNav-icons.svg?raw";

const props = defineProps({
	debug: { type: Boolean, default: false },
	mapOptions: { type: Object, default: () => ({}) },
});

// UI
import Top from "@/components/ui/top.vue";
// import Nav from "@/components/ui/side/nav.vue";
import SidePanel from "@/components/ui/side/panel.vue";

import { useMap } from "@/core/useMap";
import { useUI } from "@/core/useUI";
import { usePosition } from "@/features/locate/usePosition";
import LocatePanel from "@/features/locate/panel.vue";

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

// Position — data attributes on #waymark enable test observability
const { positionMode, currentPosition } = usePosition();
const positionHasHeading = computed(
	() =>
		currentPosition.value !== null &&
		currentPosition.value?.properties?.heading !== null &&
		currentPosition.value?.properties?.heading !== undefined,
);

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
	openPanel("locate", LocatePanel);
}
</script>

<template>
	<div style="display: none" v-html="iconSprite"></div>
	<div id="top">
		<Top />
	</div>

	<div id="content" class="page-content">
		<!-- <Nav id="side-nav" /> -->

		<SidePanel />
	</div>

	<!-- Map -->
	<div
		ref="mapContainer"
		id="waymark"
		:data-position-mode="positionMode || ''"
		:data-position-heading="positionHasHeading ? 'true' : 'false'"
		:class="{ 'panel-open': isPanelVisible && isDesktop }"
		@click="handleMapClick"
	/>
</template>

<style>
body {
	z-index: 0;
}

#waymark {
	z-index: 1;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	transition: left 0.3s ease, width 0.3s ease;
}

#waymark.panel-open {
	left: var(--bs-offcanvas-width, 400px);
	width: calc(100% - var(--bs-offcanvas-width, 400px));
}

#top {
	z-index: 1060;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}
</style>

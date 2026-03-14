<script setup>
import { onMounted, ref } from "vue";
import { createInstance } from "@ogis/waymark-js";
import "@ogis/waymark-js/dist/waymark-js.css";

// UI
import Top from "@/components/ui/top.vue";
// import Nav from "@/components/ui/side/nav.vue";
import SidePanel from "@/components/ui/side/panel.vue";

import { useWaymark } from "@/core/useWaymark";
import { useUI } from "@/core/useUI";

// Map Store
const { setInstance } = useWaymark();

// UI Store
const {
	closeNav,
	togglePanelExpanded,
	isNavVisible,
	isPanelVisible,
	isPanelExpanded,
	isDesktop,
	isMobile,
} = useUI();

const handleMapClick = () => {
	// If Mobile Nav is visible, close it
	if (isNavVisible.value && !isDesktop.value) {
		closeNav();
	}

	// If Mobile Panel is visible and expanded, collapse it (minimize it)
	if (isMobile.value && isPanelVisible.value && isPanelExpanded.value) {
		togglePanelExpanded();
	}
};

const instanceReady = ref(false);

onMounted(() => {
	// Create & set the main Waymark Instance
	createInstance({
		debug: false,
		id: "waymark",
		mapOptions: {
			attributionControl: false,
		},
		onLoad: (WaymarkInstance) => {
			setInstance(WaymarkInstance);
			instanceReady.value = true;
		},
	});
});
</script>

<template>
	<div id="top" v-if="instanceReady">
		<Top />
	</div>

	<div id="content" class="page-content">
		<!-- <Nav id="side-nav" /> -->

		<SidePanel />
	</div>

	<!-- Map -->
	<div id="waymark" @click="handleMapClick" />
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
}

#top {
	z-index: 1060;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}
</style>

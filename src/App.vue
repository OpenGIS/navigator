<script setup>
import { ref, inject } from "vue";
import iconSprite from "@ogis/icons/dist/ogis-icons.svg?raw";

const props = defineProps({
	debug: { type: Boolean, default: false },
	mapOptions: { type: Object, default: () => ({}) },
});

// UI
import Top from "@/components/ui/top.vue";
import Panels from "@/components/ui/panels.vue";

import { useMap } from "@/composables/useMap";
import { useUI } from "@/composables/useUI";
import { useSettings } from "@/composables/useSettings";

const instanceId = inject("navigatorId", "navigator");

// Map — template ref passed so useMap manages the full lifecycle
const mapContainer = ref(null);
useMap(mapContainer, props.mapOptions);

const { resolvedTheme } = useSettings();

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
	openPanel();
}
</script>

<template>
	<div
		class="navigator-root position-fixed top-0 start-0 w-100 h-100 overflow-hidden"
		:data-bs-theme="resolvedTheme"
	>
		<div style="display: none" v-html="iconSprite"></div>
		<!-- 		<div class="navigator-top">
			<Top />
		</div> -->

		<div class="navigator-content">
			<Panels />
		</div>

		<!-- Map -->
		<div
			ref="mapContainer"
			class="navigator-map"
			:data-navigator-id="instanceId"
			:class="{ 'panel-open': isPanelVisible && isDesktop }"
			@click="handleMapClick"
		/>
	</div>
</template>

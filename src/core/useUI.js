import { ref, computed, markRaw, inject } from "vue";

// Per-instance state: instanceId -> state object
const instances = new Map();
// Per-instance resize listener cleanup: instanceId -> cleanup fn
const resizeCleanups = new Map();

function createState(instanceId) {
    // isFirstLoad is true when the map view has never been persisted for this instance.
    // The "view" namespace mirrors what useMap uses — if that key exists the user has
    // visited before.
    const storageKey = `navigator_view_${instanceId}`;
    return {
        width: ref(window.innerWidth),
        isFirstLoad: ref(!localStorage.getItem(storageKey)),
        isNavVisible: ref(window.innerWidth >= 992),
        isNavExpanded: ref(false),
        isPanelVisible: ref(false),
        isPanelExpanded: ref(false),
        activePanelId: ref(null),
        activePanelComponent: ref(null),
    };
}

export const useUI = () => {
    const instanceId = inject("navigatorId", "navigator");

    if (!instances.has(instanceId)) {
        instances.set(instanceId, createState(instanceId));

        const s = instances.get(instanceId);
        const onResize = () => {
            s.width.value = window.innerWidth;
            if (s.width.value >= 992) {
                s.isNavVisible.value = true;
            } else if (s.isNavVisible.value && !s.isNavExpanded.value) {
                s.isNavVisible.value = false;
            }
        };

        window.addEventListener("resize", onResize);
        resizeCleanups.set(instanceId, () =>
            window.removeEventListener("resize", onResize),
        );
    }

    const s = instances.get(instanceId);

    // --- Computed ---

    const isDesktop = computed(() => s.width.value >= 992);
    const isTablet = computed(() => s.width.value >= 768 && s.width.value < 992);
    const isMobile = computed(() => s.width.value < 768);

    // --- Actions ---

    const toggleNav = () => {
        s.isNavVisible.value = !s.isNavVisible.value;
        if (s.isNavVisible.value && !isDesktop.value) {
            s.isNavExpanded.value = true;
        } else {
            s.isNavExpanded.value = false;
        }
    };

    const closeNav = () => {
        s.isNavVisible.value = false;
        if (!isDesktop.value) {
            s.isNavExpanded.value = false;
        }
    };

    const setNavExpanded = (value) => {
        s.isNavExpanded.value = value;
    };

    /**
     * Open a panel with specific content.
     * @param {string} id - Unique identifier for the panel
     * @param {Object} component - The Vue component to render
     */
    const openPanel = (id, component) => {
        s.activePanelId.value = id;
        if (component) {
            s.activePanelComponent.value = markRaw(component);
        }
        s.isPanelVisible.value = true;
        s.isPanelExpanded.value = true;
        if (s.isNavVisible.value && !isDesktop.value) {
            s.isNavVisible.value = false;
        }
        s.isNavExpanded.value = false;
    };

    /**
     * Toggle a panel open/closed, or switch to a new panel.
     * @param {string} id - Unique identifier for the panel
     * @param {Object} component - The Vue component to render
     */
    const togglePanel = (id, component) => {
        if (s.isNavVisible.value && !isDesktop.value) {
            openPanel(id, component);
            return;
        }

        if (s.activePanelId.value === id) {
            if (s.isPanelVisible.value) {
                if (s.isPanelExpanded.value) {
                    s.isPanelVisible.value = false;
                    s.activePanelId.value = null;
                } else {
                    s.isPanelExpanded.value = true;
                }
            } else {
                openPanel(id, component);
            }
        } else {
            openPanel(id, component);
        }
    };

    const closePanel = () => {
        s.isPanelVisible.value = false;
    };

    const togglePanelExpanded = () => {
        s.isPanelExpanded.value = !s.isPanelExpanded.value;
    };

    const setPanelExpanded = (value) => {
        s.isPanelExpanded.value = value;
    };

    const setFirstLoadComplete = () => {
        s.isFirstLoad.value = false;
    };

    return {
        // State
        width: s.width,
        isNavVisible: s.isNavVisible,
        isNavExpanded: s.isNavExpanded,
        isPanelVisible: s.isPanelVisible,
        isPanelExpanded: s.isPanelExpanded,
        activePanelId: s.activePanelId,
        activePanelComponent: s.activePanelComponent,
        isFirstLoad: s.isFirstLoad,

        // Computed
        isDesktop,
        isTablet,
        isMobile,

        // Actions
        toggleNav,
        closeNav,
        setNavExpanded,
        openPanel,
        togglePanel,
        closePanel,
        togglePanelExpanded,
        setPanelExpanded,
        setFirstLoadComplete,
    };
};

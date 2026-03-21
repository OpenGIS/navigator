import { ref, computed, markRaw } from "vue";

// --- State ---

// Device / Screen Size
const width = ref(window.innerWidth);

// First Load — true when navigator_waymark has never been persisted
const isFirstLoad = ref(!localStorage.getItem("navigator_waymark"));

// Nav (Left Sidebar)
const isNavVisible = ref(width.value >= 992); // Toggles entire sidebar visibility
const isNavExpanded = ref(false); // Toggles expanded/collapsed mode (desktop hover or mobile open)

// Panel (Right Sidebar / Content Panel)
const isPanelVisible = ref(false); // Toggles entire panel visibility
const isPanelExpanded = ref(false); // Toggles expanded/collapsed mode
const activePanelId = ref(null); // String ID for active panel
const activePanelComponent = ref(null); // The actual Vue component to render

export const useUI = () => {
    // --- Computed ---

    const isDesktop = computed(() => width.value >= 992);
    const isTablet = computed(() => width.value >= 768 && width.value < 992);
    const isMobile = computed(() => width.value < 768);

    // --- Actions ---

    // Window Resize Handler
    window.addEventListener("resize", () => {
        width.value = window.innerWidth;

        // Auto-adjust states based on breakpoints
        if (isDesktop.value) {
            isNavVisible.value = true; // Always show nav on desktop
        } else {
            // Hide nav if it was only temporarily shown (not fully expanded interaction)
            if (isNavVisible.value && !isNavExpanded.value) {
                isNavVisible.value = false;
            }
        }
    });

    // Navigation Actions
    const toggleNav = () => {
        isNavVisible.value = !isNavVisible.value;
        // Ensure expanded state matches visibility on mobile
        if (isNavVisible.value && !isDesktop.value) {
            isNavExpanded.value = true;
        } else {
            isNavExpanded.value = false;
        }
    };

    const closeNav = () => {
        isNavVisible.value = false;
        if (!isDesktop.value) {
            isNavExpanded.value = false;
        }
    };

    const setNavExpanded = (value) => {
        isNavExpanded.value = value;
    };

    // Panel Actions

    /**
     * Open a panel with specific content.
     * Ensures the panel is visible and expanded.
     * @param {string} id - Unique identifier for the panel
     * @param {Object} component - The Vue component to render
     */
    const openPanel = (id, component) => {
        // Update content
        activePanelId.value = id;
        if (component) {
            activePanelComponent.value = markRaw(component);
        }

        // Ensure visible and expanded
        isPanelVisible.value = true;
        isPanelExpanded.value = true;

        // Close mobile nav if open
        if (isNavVisible.value && !isDesktop.value) {
            isNavVisible.value = false;
        }
        isNavExpanded.value = false;
    };

    /**
     * Toggles a panel's visibility or expansion state.
     * @param {string} id - Unique identifier for the panel
     * @param {Object} component - The Vue component to render
     */
    const togglePanel = (id, component) => {
        // Mobile: Always treat as opening a new view (overlay)
        if (isNavVisible.value && !isDesktop.value) {
            openPanel(id, component);
            return;
        }

        // Desktop: Toggle logic
        if (activePanelId.value === id) {
            if (isPanelVisible.value) {
                if (isPanelExpanded.value) {
                    // If open and expanded, close it
                    isPanelVisible.value = false;
                    activePanelId.value = null;
                } else {
                    // If collapsed, expand it
                    isPanelExpanded.value = true;
                }
            } else {
                // If hidden, open it
                openPanel(id, component);
            }
        } else {
            // New panel selected
            openPanel(id, component);
        }
    };

    const closePanel = () => {
        isPanelVisible.value = false;
    };

    const togglePanelExpanded = () => {
        isPanelExpanded.value = !isPanelExpanded.value;
    };

    const setPanelExpanded = (value) => {
        isPanelExpanded.value = value;
    };

    const setFirstLoadComplete = () => {
        isFirstLoad.value = false;
    };

    return {
        // State
        width,
        isNavVisible,
        isNavExpanded,
        isPanelVisible,
        isPanelExpanded,
        activePanelId,
        activePanelComponent,
        isFirstLoad,

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

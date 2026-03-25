<script setup>
import { computed } from "vue";
import { useLocate } from "@/features/locate/useLocate";
import Icon from "@/components/ui/icon.vue";

const { mode, showConfirmModal, showErrorModal, cycle, confirmLocate } =
    useLocate();

const iconName = computed(() => {
    if (mode.value === "following") return "position-lock";
    return "position";
});

const iconColor = computed(() => {
    if (mode.value === "active" || mode.value === "following")
        return "var(--bs-primary)";
    if (mode.value === "error") return "var(--bs-danger)";
    return "currentColor";
});

const label = computed(() => {
    if (mode.value === "active") return "Located";
    if (mode.value === "following") return "Following";
    if (mode.value === "error") return "Error";
    return "Locate";
});
</script>

<template>
    <button
        type="button"
        class="locate-btn border-0 bg-transparent d-flex flex-column align-items-center p-1"
        :class="{ 'locate-btn--error': mode === 'error' }"
        id="locate-button"
        :aria-label="label"
        :aria-pressed="mode !== null && mode !== 'error'"
        @click="cycle"
    >
        <Icon
            width="40"
            height="40"
            :fill="iconColor"
            :name="iconName"
        />
        <span class="locate-btn__label" :style="{ color: iconColor }">{{
            label
        }}</span>
    </button>

    <!-- Confirmation modal — shown on first use before the browser permission prompt -->
    <Teleport to="body">
        <template v-if="showConfirmModal">
            <div class="modal-backdrop fade show navigator-modal-backdrop"></div>
            <div
                class="modal fade show d-block navigator-modal"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="locate-confirm-title"
            >
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="locate-confirm-title">
                                Permission Required
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                aria-label="Cancel"
                                @click="showConfirmModal = false"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">
                                To display your current location and compass
                                heading, this app needs your permission. When
                                prompted, please allow location and compass
                                access.
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-secondary"
                                @click="showConfirmModal = false"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                class="btn btn-primary"
                                id="locate-confirm-allow"
                                @click="confirmLocate"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Teleport>

    <!-- Error modal — shown on permission denied, or when clicking the Error button -->
    <Teleport to="body">
        <template v-if="showErrorModal">
            <div class="modal-backdrop fade show navigator-modal-backdrop"></div>
            <div
                class="modal fade show d-block navigator-modal"
                tabindex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="locate-error-title"
            >
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="locate-error-title">
                                Location access denied
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                aria-label="Close"
                                @click="showErrorModal = false"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <p>
                                Your browser has blocked location access for
                                this page. To re-enable it:
                            </p>
                            <ul class="small mb-0">
                                <li>
                                    <strong>Chrome / Edge (desktop):</strong>
                                    Click the lock icon in the address bar →
                                    Site settings → Location → Allow.
                                </li>
                                <li>
                                    <strong>Firefox (desktop):</strong> Click
                                    the lock icon → Clear permission → reload
                                    the page and try again.
                                </li>
                                <li>
                                    <strong>Safari (desktop / iOS):</strong>
                                    Settings → Privacy &amp; Security → Location
                                    Services → find your browser → Allow.
                                </li>
                                <li>
                                    <strong>Android Chrome:</strong> Settings →
                                    Site settings → Location → find this site
                                    and allow it.
                                </li>
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-primary"
                                id="locate-error-close"
                                @click="showErrorModal = false"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Teleport>
</template>

<style scoped>
.locate-btn {
    cursor: pointer;
    line-height: 1;
    position: relative;
    padding-bottom: 18px; /* reserve space for the absolutely-positioned label */
}

.locate-btn:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
    border-radius: 4px;
}

.locate-btn__label {
    font-size: 0.625rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    /* Take the label out of the flow so it never widens the button */
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    pointer-events: none;
}
</style>

<style>
/* Global: ensure modals sit above the top nav bar */
.navigator-modal-backdrop {
    z-index: 1065;
}

.navigator-modal {
    z-index: 1070;
}

/* Map marker styles */
.navigator-locate-position,
.navigator-locate-heading {
    color: var(--bs-primary);
    line-height: 0;
    pointer-events: none;
}
</style>

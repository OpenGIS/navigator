<script setup>
import { computed } from "vue";
import { useLocate } from "@/features/locate/useLocate";
import { useLocale } from "@/core/useLocale";
import IconButton from "@/components/ui/icon-button.vue";

const { mode, showConfirmModal, showErrorModal, cycle, confirmLocate } =
    useLocate();
const { t } = useLocale();

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
    if (mode.value === "active") return t("locate.button.located");
    if (mode.value === "following") return t("locate.button.following");
    if (mode.value === "error") return t("locate.button.error");
    return t("locate.button.locate");
});
</script>

<template>
    <IconButton
        :icon="iconName"
        :label="label"
        :icon-color="iconColor"
        :active="mode !== null && mode !== 'error'"
        :class="{ 'locate-btn--error': mode === 'error' }"
        id="locate-button"
        :aria-label="label"
        @click="cycle"
    />

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
                                {{ t('locate.modal.permissionTitle') }}
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                aria-label="Close"
                                @click="showConfirmModal = false"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <p class="mb-0">{{ t('locate.modal.permissionBody') }}</p>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-secondary"
                                @click="showConfirmModal = false"
                            >
                                {{ t('locate.modal.cancel') }}
                            </button>
                            <button
                                type="button"
                                class="btn btn-primary"
                                id="locate-confirm-allow"
                                @click="confirmLocate"
                            >
                                {{ t('locate.modal.iUnderstand') }}
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
                                {{ t('locate.modal.deniedTitle') }}
                            </h5>
                            <button
                                type="button"
                                class="btn-close"
                                aria-label="Close"
                                @click="showErrorModal = false"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <p>{{ t('locate.modal.deniedIntro') }}</p>
                            <ul class="small mb-0">
                                <li><strong>Chrome / Edge (desktop):</strong> {{ t('locate.modal.deniedChrome') }}</li>
                                <li><strong>Firefox (desktop):</strong> {{ t('locate.modal.deniedFirefox') }}</li>
                                <li><strong>Safari (desktop / iOS):</strong> {{ t('locate.modal.deniedSafari') }}</li>
                                <li><strong>Android Chrome:</strong> {{ t('locate.modal.deniedAndroid') }}</li>
                            </ul>
                        </div>
                        <div class="modal-footer">
                            <button
                                type="button"
                                class="btn btn-primary"
                                id="locate-error-close"
                                @click="showErrorModal = false"
                            >
                                {{ t('locate.modal.close') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Teleport>
</template>

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

<script setup>
import { computed, ref } from "vue";
import { useMap } from "@/composables/useMap";
import { useLocale } from "@/composables/useLocale";
import Icon from "@/components/ui/icon.vue";

const { mapView } = useMap();
const { t } = useLocale();

const copied = ref(false);

const shareUrl = computed(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    if (!mapView.value) return `${base}${window.location.hash}` || base;
    const { lat, lng } = mapView.value;
    const zoom = Math.round(mapView.value.zoom);
    return `${base}#map=${zoom}/${lat.toFixed(6)}/${lng.toFixed(6)}`;
});

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(shareUrl.value);
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
    } catch {
        // fallback: select the textarea text
        const el = document.querySelector(".navigator-share-textarea");
        if (el) { el.select(); document.execCommand("copy"); }
    }
};
</script>

<template>
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
        <h5 class="mb-0">{{ t('panel.locate.title') }}</h5>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
        <p class="mb-2 small text-body-secondary">{{ t('panel.locate.shareDescription') }}</p>

        <textarea
            class="navigator-share-textarea form-control form-control-sm font-monospace mb-2"
            :value="shareUrl"
            readonly
            rows="3"
            @focus="$event.target.select()"
        ></textarea>

        <button
            type="button"
            class="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
            :class="copied ? 'btn-success' : 'btn-outline-primary'"
            @click="copyLink"
        >
            <Icon width="16" height="16" fill="currentColor" :name="copied ? 'check' : 'globe'" />
            {{ copied ? t('panel.locate.copied') : t('panel.locate.copyLink') }}
        </button>
    </div>
</template>

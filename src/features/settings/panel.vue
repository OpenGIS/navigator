<script setup>
import { useSettings } from "@/features/settings/useSettings";

const { isDark, resolvedUnits, toggleTheme, setUnits } = useSettings();
</script>

<template>
    <div class="sidebar-section sidebar-section-body p-3 pb-0">
        <h5 class="mb-0">Settings</h5>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
        <h6 class="mb-3 text-muted small text-uppercase fw-semibold">
            Appearance
        </h6>
        <div class="form-check form-switch">
            <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="settings-dark-mode"
                :checked="isDark"
                @change="toggleTheme"
            />
            <label class="form-check-label" for="settings-dark-mode">
                Dark mode
            </label>
        </div>
    </div>

    <div class="sidebar-section sidebar-section-body p-3 border-top">
        <h6 class="mb-3 text-muted small text-uppercase fw-semibold">Units</h6>
        <select
            id="settings-units"
            class="form-select form-select-sm w-auto"
            :value="resolvedUnits"
            @change="(e) => setUnits(e.target.value)"
        >
            <option value="metric">Metric (km, m/s)</option>
            <option value="imperial">Imperial (mi, mph)</option>
        </select>
    </div>
</template>

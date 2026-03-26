<script setup>
import { useUI } from "@/core/useUI";
import { useLocale } from "@/core/useLocale";
import { useSettings } from "@/features/settings/useSettings";

const { showAboutModal, closeAboutModal } = useUI();
const { t, locale, locales, localeNames, setLocale } = useLocale();
const { resolvedUnits, setUnits } = useSettings();
</script>

<template>
  <Teleport to="body">
    <template v-if="showAboutModal">
      <div class="modal-backdrop fade show navigator-modal-backdrop"></div>
      <div
        class="modal fade show d-block navigator-modal"
        id="about-modal"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="about-modal-title">
                {{ t('about.title') }}
              </h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Close"
                @click="closeAboutModal"
              ></button>
            </div>
            <div class="modal-body">
              <p>{{ t('about.welcome') }}</p>
              <p>{{ t('about.useMenu') }}</p>
              <p class="fw-semibold mb-2">{{ t('about.preferences') }}</p>
              <div class="mb-2">
                <label for="about-language" class="form-label small mb-1">
                  {{ t('settings.language') }}
                </label>
                <select
                  id="about-language"
                  class="form-select form-select-sm w-auto"
                  :value="locale"
                  @change="(e) => setLocale(e.target.value)"
                >
                  <option v-for="code in locales" :key="code" :value="code">
                    {{ localeNames[code] }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="about-units" class="form-label small mb-1">
                  {{ t('settings.units') }}
                </label>
                <select
                  id="about-units"
                  class="form-select form-select-sm w-auto"
                  :value="resolvedUnits"
                  @change="(e) => setUnits(e.target.value)"
                >
                  <option value="metric">{{ t('settings.metric') }}</option>
                  <option value="imperial">{{ t('settings.imperial') }}</option>
                </select>
              </div>
              <p class="mb-0 text-body-secondary small">
                {{ t('about.poweredBy') }}
              </p>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-primary"
                id="about-modal-close"
                @click="closeAboutModal"
              >
                {{ t('about.getStarted') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

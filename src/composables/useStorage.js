import { reactive, watch, inject } from "vue";

/**
 * Reactive localStorage wrapper scoped to a Navigator instance.
 *
 * @param {string} namespace - Storage namespace (e.g. 'settings', 'recordings')
 * @param {Object} [defaultState={}] - Default state shape
 * @param {string} [instanceId] - Navigator instance ID. If omitted, resolved via inject('navigatorId').
 *   Pass explicitly when calling from a plugin install() or other non-setup context.
 * @returns {import('vue').UnwrapNestedRefs<Object>}
 */
export function useStorage(namespace, defaultState = {}, instanceId) {
    const id = instanceId ?? inject("navigatorId", "navigator");
    const key = `navigator_${namespace}_${id}`;
    const state = reactive({ ...defaultState });

    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            Object.assign(state, parsed);
        }
    } catch (e) {
        console.error(`Failed to load storage for [${key}]`, e);
    }

    watch(
        state,
        (newValue) => {
            try {
                localStorage.setItem(key, JSON.stringify(newValue));
            } catch (e) {
                console.error(`Failed to save storage for [${key}]`, e);
            }
        },
        { deep: true },
    );

    return state;
}

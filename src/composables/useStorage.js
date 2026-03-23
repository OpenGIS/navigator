import { reactive, watch, inject } from "vue";

export function useStorage(namespace, defaultState = {}) {
    const instanceId = inject("navigatorId", "navigator");
    const key = `navigator_${namespace}_${instanceId}`;
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

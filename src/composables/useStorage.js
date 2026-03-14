import { reactive, watch } from "vue";

export function useStorage(namespace, defaultState = {}) {
    const key = `navigator_${namespace}`;
    const state = reactive(defaultState);

    // 1. Load from localStorage
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge stored data into state (preserving defaults for missing keys)
            Object.assign(state, parsed);
        }
    } catch (e) {
        console.error(`Failed to load storage for [${namespace}]`, e);
    }

    // 2. Watch for changes and save
    watch(
        state,
        (newValue) => {
            try {
                // Convert Map to Array for JSON serialization if necessary,
                // but since we are using reactive objects, standard JSON.stringify works fine.
                localStorage.setItem(key, JSON.stringify(newValue));
            } catch (e) {
                console.error(`Failed to save storage for [${namespace}]`, e);
            }
        },
        { deep: true },
    );

    return state;
}

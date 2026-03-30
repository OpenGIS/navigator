import { ref, computed, inject, watch } from "vue";
import { useStorage } from "@/composables/useStorage";
import { getEmitter } from "@/index.js";

const cache = new Map();

// Module-level reactive system preference — shared across all instances.
const systemDark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", (e) => {
		systemDark.value = e.matches;
	});

/**
 * Infer the user's preferred unit system from a browser locale string.
 * Only the US, Liberia (LR), and Myanmar (MM) default to imperial.
 * Returns 'imperial' for those locales, 'metric' for everything else.
 */
export function localeDefaultUnits(localeStr) {
	try {
		const region = new Intl.Locale(localeStr ?? navigator.language).maximize().region;
		return ["US", "LR", "MM"].includes(region) ? "imperial" : "metric";
	} catch {
		return "metric";
	}
}

/**
 * @param {string} [instanceId] - Navigator instance ID. If omitted, resolved via inject('navigatorId').
 *   Pass explicitly when calling from a plugin install() or other non-setup context.
 */
export const useSettings = (instanceId) => {
	const id = instanceId ?? inject("navigatorId", "navigator");

	if (!cache.has(id)) {
		const storage = useStorage("settings", {
			theme: null, // null = follow system, 'light', or 'dark'
			units: null, // null = follow locale default
			language: null, // null = follow browser / Navigator.create() default
		}, id);
		cache.set(id, { storage });
	}

	const { storage } = cache.get(id);

	// Resolve the effective theme: explicit choice or fall back to system preference.
	const resolvedTheme = computed(
		() => storage.theme ?? (systemDark.value ? "dark" : "light"),
	);

	const isDark = computed(() => resolvedTheme.value === "dark");

	// Emit theme:change when the resolved theme changes (explicit toggle or system change)
	watch(resolvedTheme, (theme) => {
		const emitter = getEmitter(id);
		if (emitter) emitter.emit("theme:change", theme);
	});

	// Resolve units: explicit choice or fall back to locale default.
	const resolvedUnits = computed(() => storage.units ?? localeDefaultUnits());
	const isMetric = computed(() => resolvedUnits.value === "metric");

	const toggleTheme = () => {
		storage.theme = isDark.value ? "light" : "dark";
	};

	const setUnits = (units) => {
		storage.units = units;
	};

	const language = computed(() => storage.language);

	const setLanguage = (lang) => {
		storage.language = lang;
	};

	return {
		resolvedTheme,
		isDark,
		isMetric,
		resolvedUnits,
		toggleTheme,
		setUnits,
		language,
		setLanguage,
	};
};

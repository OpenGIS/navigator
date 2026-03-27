import { ref, computed, inject } from "vue";
import { useStorage } from "@/composables/useStorage";

const cache = new Map();

// Module-level reactive system preference — shared across all instances.
const systemDark = ref(window.matchMedia("(prefers-color-scheme: dark)").matches);
window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", (e) => {
		systemDark.value = e.matches;
	});

/**
 * Infer the user's preferred unit system from their browser locale.
 * Only the US, Liberia (LR), and Myanmar (MM) default to imperial.
 * Returns 'imperial' for those locales, 'metric' for everything else.
 */
function localeDefaultUnits() {
	try {
		const region = new Intl.Locale(navigator.language).maximize().region;
		return ["US", "LR", "MM"].includes(region) ? "imperial" : "metric";
	} catch {
		return "metric";
	}
}

export const useSettings = () => {
	const instanceId = inject("navigatorId", "navigator");

	if (!cache.has(instanceId)) {
		const storage = useStorage("settings", {
			theme: null, // null = follow system, 'light', or 'dark'
			units: null, // null = follow locale default
			language: null, // null = follow browser / Navigator.init() default
		});
		cache.set(instanceId, { storage });
	}

	const { storage } = cache.get(instanceId);

	// Resolve the effective theme: explicit choice or fall back to system preference.
	const resolvedTheme = computed(
		() => storage.theme ?? (systemDark.value ? "dark" : "light"),
	);

	const isDark = computed(() => resolvedTheme.value === "dark");

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

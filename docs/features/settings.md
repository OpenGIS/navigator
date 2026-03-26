# Settings

The settings feature persists user preferences — colour scheme and units — and wires them into Bootstrap's native dark-mode system. Settings take effect immediately (no save button) and survive page reloads.

---

## Opening Settings

A **Settings** link sits at the very bottom of the main menu panel. Clicking it replaces the panel content with the settings panel. The standard panel close button dismisses it.

---

## Appearance

A **Dark mode** toggle switch controls the colour scheme applied to the Navigator widget.

| Switch state | Resolved theme |
|---|---|
| Off | Light |
| On | Dark |

**Default on first load:** the switch reflects the browser's `prefers-color-scheme` media query. If the system is dark the switch starts in the "on" position; if light, the "off" position. No preference is written to storage until the user explicitly toggles the switch.

Once the user has toggled, the explicit choice overrides the system preference and persists to `localStorage`.

The resolved theme is applied to the Navigator root element via the HTML attribute `data-bs-theme="light|dark"`, scoping Bootstrap CSS variables to the Navigator widget only (does not affect the rest of the host page).

---

## Units

A **Metric** toggle switch sets the unit system used across all features:

| Switch state | Unit system |
|---|---|
| On | Metric (km, m/s) |
| Off | Imperial (mi, mph) |

The locate feature's speed readout in the position panel respects this setting. A **scale bar** is also shown in the bottom-left corner of the map; it updates immediately when the units switch is toggled.

**Default on first load:** the switch reflects the user's browser locale. Locales in the US, Liberia, and Myanmar default to imperial; all other locales default to metric. No preference is written to storage until the user explicitly toggles the switch — the same pattern used for the appearance setting.

---

## Language

A **Language** dropdown selects the language used throughout the Navigator interface.

| Option | Language |
|--------|----------|
| English | English |
| Français | French |

**Default on first load:** the dropdown reflects the browser's language setting. If the browser language matches an available translation (e.g. `fr` or `fr-CA` maps to Français), that language is pre-selected; otherwise English is used. No preference is written to storage until the user explicitly makes a selection.

Once the user has selected a language, the choice overrides the browser default and persists to `localStorage`.

---

## Persistence

`useSettings` stores preferences with:

```js
useStorage('settings', { theme: null, units: null, language: null })
```

Storage key: `navigator_settings_{instanceId}`

`theme: null` means "follow the system preference". Once the user toggles the switch an explicit `'light'` or `'dark'` string is stored.

`units: null` means "follow the browser locale default". The locale is resolved via `Intl.Locale(navigator.language).maximize().region` — US, LR, and MM map to `'imperial'`; all other regions map to `'metric'`. Once the user toggles the switch an explicit `'metric'` or `'imperial'` string is stored.

`language: null` means "follow the browser language or the `locale` default set via `Navigator.init()`". Once the user selects a language from the dropdown an explicit code (`'en'`, `'fr'`, …) is stored.

---

## Navbar

The top navigation bar always uses Bootstrap's built-in dark theming (`data-bs-theme="dark"` and `bg-body` on the `<nav>` element) regardless of the app theme. This keeps the navbar consistently dark while the side panel and map UI respond to the colour mode setting.

---

## Composable API — `useSettings()`

```js
import { useSettings } from '@/features/settings/useSettings'

const {
  resolvedTheme, // Computed<'light'|'dark'> — effective theme after resolving auto
  resolvedUnits, // Computed<'metric'|'imperial'> — effective units after resolving locale default
  isDark,        // Computed<boolean>
  isMetric,      // Computed<boolean>
  toggleTheme,   // () => void — toggles between 'light' and 'dark'
  setUnits,      // (units: 'metric'|'imperial') => void
  language,      // Computed<string|null> — stored language code, or null if following default
  setLanguage,   // (code: string) => void — persist a language choice
} = useSettings()
```

`resolvedTheme` reads `prefers-color-scheme` reactively when `theme` is `null` in storage, and updates automatically when the system preference changes.

`resolvedUnits` reads the browser locale via `Intl.Locale` when `units` is `null` in storage.

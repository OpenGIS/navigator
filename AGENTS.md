# AGENTS.md — Navigator

Context for agentic coding tools. Read this before making any changes to the codebase.

---

## Git Policy

**Do not** stage (`git add`) or commit (`git commit`) changes. The developer manages all git operations manually. Git may be used in read-only mode for context (e.g. `git diff`, `git log`, `git status`).

---

## What is this project?

Navigator is an open-source mapping library published to npm as [`@ogis/navigator`](https://www.npmjs.com/package/@ogis/navigator). It wraps [MapLibre GL JS](https://maplibre.org/) and [Vue 3](https://vuejs.org/) into an embeddable map widget with a persistent UI layer. Consumers call `Navigator.create().mount()` from a `<script type="module">` tag.

The demo app (`index.html`) is also a fully installable PWA. It includes a Web App Manifest (`public/manifest.json`), PWA icons (`public/icon-*.png`), and viewport meta tags that disable page-level zoom so MapLibre handles all zooming. The demo is built with `npm run build:demo` using `vite.demo.config.js` (base: `/navigator/`).

---

## Commands

```bash
npm run dev          # start Vite dev server (demo at http://localhost:5173)
npm run build        # build the library for distribution
npm run test:unit    # run vitest unit tests (<1 s)
npm run test:e2e -- tests/e2e/{spec}.spec.js   # run only the relevant E2E spec
npm run test:e2e     # run all E2E tests
npm test             # run all tests: unit + E2E (final check before confirming a task done)
```

### Running tests — timing guidance

- A single spec takes **15–45 seconds**.
- The full suite (`npm test`) takes **2–3 minutes**.

When running tests with a shell tool, use `mode="sync"` with `initial_wait` set to at least **60** for a single spec and **240** for the full suite. You will be automatically notified when the command completes — **do not poll repeatedly with short waits**. Wait for the completion notification, then read the output once.

---

## Source Structure

```
src/
  index.js              # public API — exports Navigator.create()
  App.vue               # root Vue component
  composables/
    useStorage.js       # localStorage wrapper, instance-scoped
    useUrlHash.js       # URL hash read/write helpers
    useMap.js           # MapLibre lifecycle, view persistence
    useUI.js            # UI state: breakpoints, panel, nav, first-load
    useLocale.js        # i18n: language resolution, translations
    useSettings.js      # user preferences: theme, units, language
    useLocate.js        # GPS locate feature
  components/
    panels/
      about.vue         # About panel
      privacy.vue       # Privacy panel
      locate.vue        # Locate panel
      settings.vue      # Settings panel
    ui/
      top.vue           # top navigation bar
      top/
        locate.vue      # Locate button (top bar)
      about.vue         # About modal (first-load + menu button)
      side/
        panel.vue       # Bootstrap offcanvas side panel
        menu.vue        # default panel content (main navigation)
```

---

## Key Conventions

### Instance isolation

Every call to `Navigator.create({ id })` creates a fully isolated Vue app. The `id` is passed down via `app.provide('navigatorId', id)`. All composables call `inject('navigatorId', 'navigator')` to scope their state.

### localStorage key format

```
navigator_{namespace}_{instanceId}
```

Examples: `navigator_view_app`, `navigator_view_main-map`. The instance id is always last — this makes keys easy to read in browser DevTools.

### Composable pattern

Logic lives in composables, not components. Per-instance state is cached in a module-level `Map` keyed by `instanceId`. Example pattern:

```js
const cache = new Map();

export const useMyFeature = () => {
  const instanceId = inject('navigatorId', 'navigator');

  if (!cache.has(instanceId)) {
    cache.set(instanceId, {
      state: useStorage('my-feature', { /* defaults */ }),
    });
  }

  return cache.get(instanceId);
};
```

### CSS selectors

Core elements use classes, not ids, to avoid collisions in multi-instance setups:
- `.navigator-map` — MapLibre container
- `.navigator-top` — top navigation bar
- `.navigator-panel` — Bootstrap offcanvas side panel

### Default Coordinates

Use the following coordinates in all examples and documentation:

```
lat: 50.6539, lng: -128.0094   // Scarlet Ibis Pub, Holberg, British Columbia, Canada
```

In MapLibre `center` arrays (which are `[lng, lat]`):

```js
center: [-128.0094, 50.6539]
```

### Features

A feature's composable lives in `src/composables/`, its panel in `src/components/panels/`, and its top-bar button (if any) in `src/components/ui/top/`. See `docs/extend/5.features.md` for the full pattern.

---

## Docs

Documentation is split into two directories:

- **`docs/core/`** — Core developer docs (architecture, composables, config).
- **`docs/extend/`** — Extension docs (events, plugins, buttons, panels, theming).

Core docs:

| Doc | Purpose |
|-----|---------|
| `docs/core/1.config.md` | `Navigator.create()` config API reference |
| `docs/core/2.instances.md` | Multi-instance setup, storage convention, architecture |
| `docs/core/3.map.md` | `useMap` full API: map lifecycle, view persistence, URL hash |
| `docs/core/4.ui.md` | `useUI` full API: responsive breakpoints, panel, navigation |
| `docs/core/5.locale.md` | Locale API, translations, OSM multilingual names |
| `docs/core/6.theme.md` | Bootstrap SCSS theme architecture |
| `docs/core/7.testing.md` | Testing conventions and screenshot strategy |

Extension docs:

| Doc | Purpose |
|-----|---------|
| `docs/extend/1.events.md` | Event emitter, lifecycle callbacks |
| `docs/extend/2.buttons-panels.md` | Config-driven custom buttons and panels |
| `docs/extend/3.plugins.md` | Plugin system: writing, context, cleanup |
| `docs/extend/4.apis.md` | Accessing map, panel, settings, locale, storage |
| `docs/extend/5.features.md` | Building a complete feature as a plugin |
| `docs/extend/6.theme.md` | Custom themes for library consumers |

---

## Adding a New Feature

1. Create `src/composables/use{FeatureName}.js`, `src/components/panels/{feature-name}.vue`, and `src/components/ui/top/{feature-name}.vue` (see `docs/extend/5.features.md`)
2. Create `tests/e2e/feature-name.spec.js` (or `tests/e2e/features/feature-name.spec.js`)
3. Run `npm test -- tests/e2e/{relevant}.spec.js` during development, then `npm test` as a final check

---

## MCP

A Playwright MCP server is configured in `.github/mcp.json`. Agents with MCP support can use it to navigate the app and inspect the DOM directly.

---

## Further Reading

- `README.md` — install and usage
- `docs/core/1.config.md` — `Navigator.create()` config API reference (all options)
- `docs/core/2.instances.md` — multi-instance setup, storage convention, architecture
- `docs/core/3.map.md` — `useMap` full API
- `docs/core/4.ui.md` — `useUI` full API
- `docs/core/5.locale.md` — locale API, translations
- `docs/core/6.theme.md` — Bootstrap SCSS theme architecture
- `docs/core/7.testing.md` — testing conventions, screenshot strategy, how to run specific specs
- `docs/extend/README.md` — extending Navigator: events, plugins, buttons, panels, theming
- `docs/extend/5.features.md` — how to build a feature

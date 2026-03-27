# AGENTS.md — Navigator

Context for agentic coding tools. Read this before making any changes to the codebase.

---

## Git Policy

**Do not** stage (`git add`) or commit (`git commit`) changes. The developer manages all git operations manually. Git may be used in read-only mode for context (e.g. `git diff`, `git log`, `git status`).

---

## What is this project?

Navigator is an open-source mapping library published to npm as [`@ogis/navigator`](https://www.npmjs.com/package/@ogis/navigator). It wraps [MapLibre GL JS](https://maplibre.org/) and [Vue 3](https://vuejs.org/) into an embeddable map widget with a persistent UI layer. Consumers call `Navigator.init()` from a `<script type="module">` tag.

The demo app (`index.html`) is also a fully installable PWA. It includes a Web App Manifest (`public/manifest.json`), PWA icons (`public/icon-*.png`), and viewport meta tags that disable page-level zoom so MapLibre handles all zooming. The demo is built with `npm run build:demo` using `vite.demo.config.js` (base: `/navigator/`).

---

## Commands

```bash
npm run dev          # start Vite dev server (demo at http://localhost:5173)
npm run build        # build the library for distribution
npm test -- tests/e2e/{spec}.spec.js   # run only the relevant spec (preferred during development)
npm test             # run all tests (final check before confirming a task done)
npm run check:sync   # verify docs/tests/screenshots are in sync
```

### Running tests — timing guidance

- A single spec takes **15–45 seconds**.
- The full suite (`npm test`) takes **2–3 minutes**.

When running tests with a shell tool, use `mode="sync"` with `initial_wait` set to at least **60** for a single spec and **240** for the full suite. You will be automatically notified when the command completes — **do not poll repeatedly with short waits**. Wait for the completion notification, then read the output once.

---

## Document First

All development in this project follows a **Document First** process:

```
Document → Test → Implement → Screenshot
```

1. **Write the docs first.** Add or update the relevant `docs/N.name.md` file before writing any code.
2. **Write tests against the docs.** Each heading in a doc maps to a `test.describe` block in the corresponding spec.
3. **Implement until tests pass.** Run `npm test -- tests/e2e/{relevant}.spec.js` to track progress during development. See [docs/testing.md](docs/testing.md) for how to find the right spec.
4. **Add screenshots where helpful.** Screenshot specs live in `tests/e2e/screenshots/` and output to `assets/screenshots/docs/`.

Before marking any task done, run `npm test` (full suite) and `npm run check:sync`. Both must pass.

---

## Source Structure

```
src/
  index.js              # public API — exports Navigator.init()
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

Every call to `Navigator.init({ id })` creates a fully isolated Vue app. The `id` is passed down via `app.provide('navigatorId', id)`. All composables call `inject('navigatorId', 'navigator')` to scope their state.

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

A feature's composable lives in `src/composables/`, its panel in `src/components/panels/`, and its top-bar button (if any) in `src/components/ui/top/`. See `docs/features.md` for the full pattern.

---

## Docs / Tests / Screenshots — Sync Contract

These three things must stay in sync:

| Layer | Location | Rule |
|-------|----------|------|
| Documentation | `docs/N.name.md` | Source of truth for behaviour |
| E2E tests | `tests/e2e/N.name.spec.js` | One file per doc; `test.describe` names match doc headings |
| Screenshots | `tests/e2e/screenshots/N.name.spec.js` | One file per doc that needs illustrations; output to `assets/screenshots/docs/N.name/` |

Run `npm run check:sync` to verify mechanically. For a semantic review (do test names actually match headings?), see `tasks/sync-review.md`.

Current mapping:

| Doc | Tests | Screenshots |
|-----|-------|-------------|
| `docs/config.md` | `tests/e2e/config.spec.js` | — |
| `docs/instances.md` | `tests/e2e/instances.spec.js` | — |
| `docs/core.md` | `tests/e2e/core.spec.js` | `tests/e2e/screenshots/core.spec.js` |
| `docs/map.md` | `tests/e2e/map.spec.js` | `tests/e2e/screenshots/map.spec.js` |
| `docs/ui.md` | `tests/e2e/ui.spec.js` | `tests/e2e/screenshots/ui.spec.js` |
| `docs/locale.md` | `tests/e2e/locale.spec.js` | — |
| `docs/features.md` | — (developer guide, no runtime behaviour) | — |
| `docs/features/locate.md` | `tests/e2e/features/locate.spec.js` | `tests/e2e/screenshots/features/locate.spec.js` |
| `docs/features/settings.md` | `tests/e2e/features/settings.spec.js` | — |

---

## Adding a New Feature

1. Create `docs/N.feature-name.md`
2. Create `tests/e2e/N.feature-name.spec.js`
3. Create `src/composables/use{FeatureName}.js`, `src/components/panels/{feature-name}.vue`, and `src/components/ui/top/{feature-name}.vue` (see `docs/features.md`)
4. If the feature has illustratable UI, create `tests/e2e/screenshots/N.feature-name.spec.js`
5. Run `npm test -- tests/e2e/{relevant}.spec.js` during development, then `npm test && npm run check:sync` as a final check

---

## MCP

A Playwright MCP server is configured in `.github/mcp.json`. Agents with MCP support can use it to navigate the app and inspect the DOM directly.

---

## Further Reading

- `README.md` — install and usage
- `docs/config.md` — `Navigator.init()` config API reference (all options)
- `docs/instances.md` — multi-instance setup, storage convention, architecture
- `docs/map.md` — `useMap` full API
- `docs/ui.md` — `useUI` full API
- `docs/features.md` — how to build a feature
- `docs/testing.md` — testing conventions, screenshot strategy, how to run specific specs
- `tasks/sync-review.md` — agent task for a full Document First sync review

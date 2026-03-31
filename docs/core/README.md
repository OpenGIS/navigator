# Core Documentation

Welcome to the Navigator core developer docs. This guide covers the internal architecture, APIs, and composables that power the Navigator mapping library.

Navigator wraps [MapLibre GL JS](https://maplibre.org/) and [Vue 3](https://vuejs.org/) into an embeddable map widget. Consumers create instances with `Navigator.create()` and mount them to the DOM.

> **Looking to extend Navigator?** See the [Extending Navigator](../extend/README.md) docs for events, custom buttons & panels, plugins, and theming.

---

## Quick Start

```js
import Navigator from '@ogis/navigator';
import '@ogis/navigator/navigator.css';

const nav = Navigator.create({
  id: 'my-map',
  mapOptions: { center: [-128.0094, 50.6539], zoom: 12 },
  onMapReady: ({ map }) => console.log('Map loaded'),
});

nav.mount();
```

---

## Documentation Guide

The docs are ordered to walk you through the codebase from core concepts to testing:

| # | Document | Description |
|---|----------|-------------|
| 1 | [Configuration](./1.config.md) | All `Navigator.create()` options: id, locale, messages, mapOptions, buttons, callbacks, and plugins |
| 2 | [Instances](./2.instances.md) | Instance isolation, multi-instance setup, storage conventions, and architecture |
| 3 | [Map](./3.map.md) | `useMap` composable: MapLibre lifecycle, view persistence, URL hash sync, and multilingual labels |
| 4 | [UI](./4.ui.md) | `useUI` composable: responsive breakpoints, side panel, and navigation state |
| 5 | [Locale](./5.locale.md) | `useLocale` composable: language resolution, translations, and OSM multilingual names |
| 6 | [Theme](./6.theme.md) | Bootstrap SCSS theme: palette customisation, dark mode, and component overrides |
| 7 | [Testing](./7.testing.md) | Unit tests, E2E tests, screenshot specs, and the sync contract |

---

## Architecture Overview

```
Navigator.create(config)
  │
  ├── Vue 3 App
  │     ├── App.vue          ← root component
  │     ├── useMap            ← MapLibre lifecycle, view persistence
  │     ├── useUI             ← responsive breakpoints, panel, nav state
  │     ├── useSettings       ← theme, units, language preferences
  │     ├── useLocale         ← i18n resolution and translations
  │     └── useStorage        ← localStorage wrapper, instance-scoped
  │
  ├── EventEmitter            ← per-instance, framework-agnostic events
  │     ├── map:ready
  │     ├── view:change
  │     ├── theme:change
  │     └── panel:change
  │
  └── Plugins                 ← global (Navigator.use) or per-instance
```

### Key Principles

- **Instance isolation.** Every `Navigator.create()` call produces a fully independent Vue app with its own map, state, and localStorage namespace. The `id` is propagated via `provide/inject` and used to scope all storage keys.

- **Composable-first.** Business logic lives in composables (`src/composables/`), not components. State is cached in module-level `Map` objects keyed by instance ID.

- **Document First.** All development follows a Document → Test → Implement → Screenshot workflow. See the [Testing](./7.testing.md) guide for details.

---

## Source Structure

```
src/
  index.js                    # public API: Navigator.create(), getMapInstance()
  App.vue                     # root Vue component
  classes/
    EventEmitter.js           # per-instance event emitter
    Position.js               # geolocation data model
  composables/
    useStorage.js             # localStorage wrapper, instance-scoped
    useUrlHash.js             # URL hash read/write helpers
    useMap.js                 # MapLibre lifecycle, view persistence
    useUI.js                  # UI state: breakpoints, panel, nav
    useLocale.js              # i18n: language resolution, translations
    useSettings.js            # user preferences: theme, units, language
    useLocate.js              # GPS locate feature
  components/
    panels/                   # side panel content for each feature
    ui/
      top.vue                 # top navigation bar (renders custom buttons)
      panels.vue              # side panel container (renders custom panels)
      top/                    # per-feature toolbar buttons
```

---

## Further Reading

- [README.md](../../README.md) — install and usage
- [AGENTS.md](../../AGENTS.md) — agent context for AI coding tools
- [docs/guide/](../guide/) — user-facing feature documentation
- [Extending Navigator](../extend/README.md) — events, plugins, buttons, panels, and theming

---

**Next:** [Configuration →](./1.config.md)

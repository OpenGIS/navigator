# Extending Navigator

Navigator is designed to be extended. The event emitter, lifecycle callbacks, config-driven buttons, and plugin system give consumers multiple levels of customisation — from simple one-liners to full third-party plugins.

> **Looking for core internals?** See the [Core Documentation](../core/README.md) for architecture, composables, and the config API reference.

---

## Quick Start

```js
import Navigator from '@ogis/navigator';
import '@ogis/navigator/navigator.css';

const nav = Navigator.create({
  id: 'my-map',
  mapOptions: { center: [-128.0094, 50.6539], zoom: 12 },
});

// React to events before mounting
nav.on('map:ready', ({ map }) => {
  map.addSource('markers', { type: 'geojson', data: myGeoJSON });
});

nav.mount();
```

---

## Documentation Guide

The docs are ordered from simple integration to advanced extension patterns:

| # | Document | Description |
|---|----------|-------------|
| 1 | [Events](./1.events.md) | `create()` / `mount()` API, event emitter, built-in events, lifecycle callbacks |
| 2 | [Buttons & Panels](./2.buttons-panels.md) | Config-driven custom buttons, panel tabs, Vue component integration |
| 3 | [Plugins](./3.plugins.md) | Writing plugins, plugin context, global and per-instance registration, cleanup |
| 4 | [APIs](./4.apis.md) | Accessing the map, controlling the panel, reading preferences, translations, storage, icons |
| 5 | [Building Features](./5.features.md) | Complete example: building a GPS recordings feature as a plugin |
| 6 | [Custom Themes](./6.theme.md) | Creating and using a custom Bootstrap SCSS theme |

---

## Choosing an Integration Method

| Method | Best for | Docs |
|--------|----------|------|
| **Event listeners** | Reacting to map load, view changes, theme toggles | [Events](./1.events.md) |
| **Lifecycle callbacks** | Simple config-based event handling | [Events](./1.events.md#lifecycle-callbacks) |
| **Config-driven buttons & panels** | Custom toolbar actions, static panel content | [Buttons & Panels](./2.buttons-panels.md) |
| **Plugin system** | Reusable features with lifecycle hooks, map layers, shared state | [Plugins](./3.plugins.md) |
| **Direct Vue app access** | Maximum flexibility — register global components, provide services | [Events](./1.events.md#the-create--mount-api) |

Most features use the **plugin** approach. A plugin registers its own buttons, panels, state, and map layers — consumers only need a single import. See [Building Features](./5.features.md) for a complete walkthrough.

---

## Summary

| Goal | API | Since |
|------|-----|-------|
| React to map load | `onMapReady` callback or `map:ready` event | 1.0.0 |
| Track view changes | `onViewChange` callback or `view:change` event | 1.0.0 |
| Respond to theme toggle | `onThemeChange` callback or `theme:change` event | 1.0.13 |
| Clean up on unmount | `destroy` event or return cleanup from `install()` | 1.0.21 |
| Add a toolbar button | `buttons` array in config | 1.0.0 |
| Add a Vue component button | `buttons` with `component` property | 1.0.16 |
| Add a toolbar button with panel | `buttons` with `panel` property | 1.0.0 |
| Add a panel tab (no button) | `panels` array in config | 1.0.0 |
| Render a Vue component in a panel | `component` property in panel config | 1.0.16 |
| Write a reusable extension | Plugin with `install()` method | 1.0.0 |
| Register UI from a plugin | `addButton()` / `addPanel()` in plugin context | 1.0.22 |
| Share state with components (plugin) | `provide(key, value)` in plugin context | 1.0.22 |
| Pass options to per-instance plugins | Tuple `[plugin, opts]` or `{ plugin, options }` | 1.0.22 |
| Configure Vue before mount | Access `nav.app` between `create()` and `mount()` | 1.0.0 |
| Replace the entire navbar | `nav.app.component()` before `mount()` | 1.0.0 |
| Access the map from a component | `useMap()` export | 1.0.21 |
| Access the map externally | `getMapInstance(id)` or `map:ready` event | 1.0.0 |
| Control the panel from a component | `useUI()` export | 1.0.20 |
| Read user preferences (component) | `useSettings()` export | 1.0.24 |
| Read user preferences (plugin) | `useSettings()` on plugin context | 1.0.24 |
| Translate UI (component) | `useLocale()` export | 1.0.24 |
| Translate UI (plugin) | `useLocale()` on plugin context | 1.0.24 |
| Persist state (component) | `useStorage(ns, defaults)` | 1.0.21 |
| Persist state (plugin) | `useStorage(ns, defaults, instanceId)` | 1.0.21 |

---

**Next:** [Events →](./1.events.md)

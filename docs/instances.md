# Navigator Instances

This document covers how to create and configure Navigator instances, including support for multiple instances on the same page.

---

## Creating an Instance

Import the library and call `Navigator.init()` with a configuration object.

```html
<script type="module">
  import Navigator from '@ogis/navigator';
  import '@ogis/navigator/navigator.css';

  Navigator.init({ id: 'my-map' });
</script>
```

`Navigator.init()` returns the underlying Vue application instance, which you can use to unmount or extend the app.

---

## Configuration

```js
Navigator.init({
  id: 'my-map',        // required for named instances; defaults to 'navigator'
  mapOptions: {},      // passed directly to the MapLibre Map constructor
  debug: false,        // reserved for future debug tooling
})
```

See [`docs/config.md`](./config.md) for the full configuration reference, including the `locale` and `messages` options.

### `id` — Instance identifier

The `id` serves two purposes:

1. **Mount target.** Navigator looks for a `<div id="{id}">` in the DOM. If one is not found, it creates and appends it to `<body>`.
2. **Storage namespace.** All `localStorage` keys for this instance include the `id` as a suffix, so multiple instances on the same page do not collide.

| Instance `id` | localStorage key for map view |
|---------------|-------------------------------|
| `navigator` (default) | `navigator_view_navigator` |
| `main-map` | `navigator_view_main-map` |
| `secondary` | `navigator_view_secondary` |

### `mapOptions`

Any [MapLibre `MapOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) can be passed here and will be merged with Navigator's defaults (OpenFreeMap bright style, attribution control enabled).

```js
Navigator.init({
  id: 'my-map',
  mapOptions: {
    zoom: 12,
    center: [-128.0094, 50.6539],
    bearing: 45,
  },
});
```

---

## Multiple Instances on the Same Page

Each call to `Navigator.init()` creates a fully isolated Vue application with its own state, map instance, and localStorage namespace.

```html
<div id="map-a"></div>
<div id="map-b"></div>

<script type="module">
  import Navigator from '@ogis/navigator';
  import '@ogis/navigator/navigator.css';

  Navigator.init({ id: 'map-a', mapOptions: { center: [-128.0094, 50.6539], zoom: 10 } });
  Navigator.init({ id: 'map-b', mapOptions: { center: [-128.0094, 50.6539], zoom: 14 } });
</script>
```

Each instance maintains separate:
- Map state (center, zoom, layers)
- UI state (panel visibility, responsive breakpoints)
- Persisted localStorage (`navigator_view_map-a`, `navigator_view_map-b`)

---

## Unmounting an Instance

The Vue app returned by `Navigator.init()` can be unmounted when no longer needed. This removes the map, cleans up event listeners, and destroys the Vue component tree.

```js
const app = Navigator.init({ id: 'my-map' });

// Later...
app.unmount();
```

---

## Internal Storage Convention

Navigator uses a composable (`useStorage`) to persist state to `localStorage`. Keys follow the pattern:

```
navigator_{namespace}_{instanceId}
```

| Key | Purpose |
|-----|---------|
| `navigator_view_{id}` | Map center and zoom |

Feature-specific namespaces follow the same pattern (e.g. a hypothetical route feature on instance `main-map` would use `navigator_route_main-map`).

---

## Architecture Notes

### Instance isolation

All core composables (`useMap`, `useUI`, `useStorage`) are instance-aware. They use Vue's `provide/inject` mechanism — `Navigator.init()` calls `app.provide('navigatorId', id)`, and composables call `inject('navigatorId')` to scope their state.

### Writing instance-aware composables

Any composable added as part of a feature should follow the same pattern:

```js
import { inject } from 'vue';
import { useStorage } from '@/composables/useStorage';

// Per-instance state cache
const cache = new Map();

export const useMyFeature = () => {
  const instanceId = inject('navigatorId', 'navigator');

  if (!cache.has(instanceId)) {
    cache.set(instanceId, {
      state: useStorage('my-feature', { /* defaults */ }),
    });
  }

  const { state } = cache.get(instanceId);

  // ... actions

  return { /* public API */ };
};
```

---

## Future: Plugins

Navigator is designed to be extended with plugins. The plugin system has not been implemented yet, but the intended API is:

```js
Navigator.use(MyPlugin, options);   // register globally before init
// or
Navigator.init({ id: 'my-map', plugins: [MyPlugin] });  // per-instance
```

A plugin will receive the Vue app instance and the Navigator instance ID, allowing it to:
- Register additional composables (via `app.provide`)
- Add map layers or sources via `useMap()`
- Extend the UI by providing panel or button components
- Persist its own state via `useStorage(namespace, defaults)` (automatically instance-scoped)

When designing a plugin, keep it self-contained inside `src/features/{name}/` following the conventions in [docs/features.md](./features.md).

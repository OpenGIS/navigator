# Map — `useMap`

`useMap` manages the MapLibre GL JS map lifecycle: creation, view persistence, and cleanup. It is instance-aware — it scopes its state to the active Navigator instance via `inject('navigatorId')`.

---

## URL hash — map view sharing

Navigator reads and writes the map view to the URL hash in [OpenStreetMap format](https://wiki.openstreetmap.org/wiki/Browsing#Linking_to_a_specific_location):

```
#map={zoom}/{lat}/{lng}
```

Example: `#map=18/50.653900/-128.009400`

### Initial view from URL

If the URL contains a `#map=…` hash on page load, Navigator uses it as the initial map view — taking priority over any previously persisted view. This lets you share a specific location by URL.

### Keeping the hash in sync

As the map is panned or zoomed, the URL hash is updated automatically (throttled to once per second, matching the localStorage persistence interval). The hash and the persisted view are always kept in sync.

### Share link in the menu

The navigation menu panel displays the current map coordinates and zoom level, and a **Share this view** link. Clicking the link opens the current map view in a new tab, or you can copy the URL to share a specific location.

The **Current view** section is hidden on a true first visit (no URL hash, no persisted view). It appears as soon as a view is available — either because the page loaded with a `#map=…` hash, the user has a previously saved view, or the map has been panned or zoomed.

![Menu panel with current view coordinates and share link](../assets/screenshots/docs/map/url-hash.png)

---

## `useMap` — `src/core/useMap.js`

Manages the MapLibre GL JS map lifecycle: creation, view persistence, and cleanup.

### Initialising the map

Call `useMap` with a Vue template ref from the component that owns the map container. This is done once, in `App.vue`.

```js
import { ref } from 'vue';
import { useMap } from '@/core/useMap';

const mapContainer = ref(null);
useMap(mapContainer, mapOptions);
```

```html
<div ref="mapContainer" class="navigator-map" />
```

Internally, `useMap` registers `onMounted` and `onUnmounted` hooks. On mount, a `maplibregl.Map` is created with the OpenFreeMap bright style as the default. On unmount, the map is destroyed and the instance cache is cleared.

### Accessing the map instance

Call `useMap()` without arguments from any component or feature composable to retrieve the current map instance.

```js
import { useMap } from '@/core/useMap';

const { map } = useMap();
if (map) {
  map.addSource('my-source', { type: 'geojson', data: { ... } });
}
```

> **Note:** `map` is `null` until the MapLibre `load` event has fired. Features that add sources or layers must guard against this or be triggered by user interaction (which always happens after load).

### View persistence

The current map center and zoom are automatically saved to `localStorage` under the key `navigator_view_{instanceId}` after every map movement (throttled to once per second). On the next load, the saved view is restored via `map.jumpTo()`.

This is the same key `useUI` checks for `isFirstLoad` — the presence of this key signals that the user has visited before.

### `mapOptions`

Any [MapLibre `MapOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) passed to `Navigator.init()` are forwarded to the `Map` constructor and merged with the defaults:

```js
{
  style: 'https://tiles.openfreemap.org/styles/bright',
  attributionControl: true,
  // ...mapOptions spread here
}
```

### Returned API

```js
const { map } = useMap();
```

| Property | Type | Description |
|----------|------|-------------|
| `map` | `maplibregl.Map \| null` | The active MapLibre map instance, or `null` before load |

### Scale bar

A [MapLibre `ScaleControl`](https://maplibre.org/maplibre-gl-js/docs/API/classes/ScaleControl/) is added to the bottom-left corner of the map. The unit (metric or imperial) follows the units preference from the settings feature and updates immediately when the setting changes.

### Multilingual map labels

Map labels follow the user's active language. On load, `useMap` applies a [coalesce expression](https://maplibre.org/maplibre-gl-js/docs/style-spec/expressions/#coalesce) to every symbol layer that renders an OSM name field:

```
name:{locale}  →  name (local)  →  name:en
```

The expression is updated reactively whenever the language changes in Settings — no page reload required.

See [`docs/locale.md` — OSM Multilingual Names](./locale.md#osm-multilingual-names) for full details.

# Configuration

Complete reference for all `Navigator.init()` options.

---

## Navigator.init()

```js
import Navigator from '@ogis/navigator';
import '@ogis/navigator/navigator.css';

Navigator.init({
  id:         'my-map',   // string   — default: 'navigator'
  debug:      false,      // boolean  — default: false
  locale:     'fr',       // string   — default: null (browser language)
  messages:   { … },     // object   — default: {}
  mapOptions: { … },     // object   — default: {}
});
```

All options are optional. Calling `Navigator.init()` with no arguments is valid.

`Navigator.init()` returns the underlying Vue application instance, which can be used to unmount the app:

```js
const app = Navigator.init({ id: 'my-map' });
app.unmount();
```

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| [`id`](#id) | `string` | `'navigator'` | DOM mount target and storage namespace |
| [`debug`](#debug) | `boolean` | `false` | Reserved for future debug tooling |
| [`locale`](#locale) | `string` | `null` | Default UI language |
| [`messages`](#messages) | `object` | `{}` | Per-language label overrides |
| [`mapOptions`](#mapoptions) | `object` | `{}` | MapLibre `Map` constructor options |

---

## `id`

**Type:** `string` **Default:** `'navigator'`

The `id` option serves two purposes:

1. **Mount target.** Navigator looks for a `<div id="{id}">` in the DOM. If one is not found, it creates one and appends it to `<body>`.
2. **Storage namespace.** All `localStorage` keys for this instance are suffixed with the `id`, so multiple instances on the same page do not collide.

```js
Navigator.init({ id: 'my-map' });
```

| Instance `id` | localStorage key for map view |
|---------------|-------------------------------|
| `navigator` (default) | `navigator_view_navigator` |
| `my-map` | `navigator_view_my-map` |
| `secondary` | `navigator_view_secondary` |

See [`docs/instances.md`](./instances.md) for full details on instance isolation and the storage key format.

---

## `debug`

**Type:** `boolean` **Default:** `false`

Enables debug mode. This option is reserved for future tooling (verbose logging, dev overlays, etc.) and currently has no visible effect.

```js
Navigator.init({ id: 'my-map', debug: true });
```

---

## `locale`

**Type:** `string` **Default:** `null`

Sets the default UI language when the user has no stored preference. Accepts any [BCP 47](https://www.ietf.org/rfc/bcp/bcp47.txt) language subtag supported by Navigator.

```js
Navigator.init({ id: 'my-map', locale: 'fr' });
```

Language resolution order:

1. **Stored user preference** — explicit language saved by the user in Settings
2. **`locale` option** — the value passed here
3. **Browser language** — `navigator.language`, exact then base code
4. **English fallback** — `'en'`

| Code | Language |
|------|----------|
| `en` | English |
| `fr` | Français |

See [`docs/locale.md`](./locale.md) for the full locale API, available languages, and how to contribute a translation.

---

## `messages`

**Type:** `object` **Default:** `{}`

Overrides individual UI labels for any language without modifying the built-in translations. Keys are BCP 47 language codes; values are objects mapping translation keys to replacement strings.

```js
Navigator.init({
  id: 'my-map',
  messages: {
    en: {
      'about.title':    'My Map',
      'about.getStarted': 'Explore',
    },
    fr: {
      'about.title':    'Ma carte',
      'about.getStarted': 'Explorer',
    },
  },
});
```

Custom messages are merged on top of the built-in translations — only the keys you supply are overridden. Any unspecified keys continue to use the built-in values.

See [`docs/locale.md`](./locale.md) for the full list of translation keys.

---

## `mapOptions`

**Type:** `object` **Default:** `{}`

Any [MapLibre `MapOptions`](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/) can be passed here. They are merged with Navigator's defaults:

| Default | Value |
|---------|-------|
| `style` | OpenFreeMap bright (`https://tiles.openfreemap.org/styles/bright`) |
| `attributionControl` | `true` |

User-supplied keys override the defaults. For example, to supply a custom style and initial view:

```js
Navigator.init({
  id: 'my-map',
  mapOptions: {
    center: [-128.0094, 50.6539],
    zoom: 12,
    bearing: 45,
    style: 'https://example.com/style.json',
  },
});
```

> **View persistence:** if the user has previously visited, their last-known center and zoom are restored from `localStorage` and take precedence over `center`/`zoom` in `mapOptions`. The stored view is cleared when the user navigates to a new location using the URL hash.

See [`docs/map.md`](./map.md) for the full map API including view persistence and programmatic control.

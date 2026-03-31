# Navigator

A navigational aid for everyone, right in the browser.

The app is free to use: no API keys, no registration, no app stores and no invasions of privacy. Just open Navigator and start exploring.

This project is inspired by, and made possible thanks to the [OpenStreetMap](https://www.openstreetmap.org/) ecosystem. Special thanks to [OpenFreeMap](https://openfreemap.org/) for their tile hosting that makes this project possible.

[&laquo;&laquo; Use Navigator &raquo;&raquo;](https://www.ogis.org/navigator/)

## Features

- Highly detailed, free global map. No install, no account.
- GPS locate with compass heading.
- Once loaded, works offline (cached tiles and data).
- Multilingual (auto-detects browser language).
- Shareable map links.
- OpenStreetMap integration (View/Edit on OSM).
- Map view synced between sessions.
- User preference settings.
- Works on any device.

[![App Preview](assets/screenshots/app-preview.png)](https://www.ogis.org/navigator/)

## Aims

- A handy, general purpose mapping tool that anyone can use.
- Offer low barriers to, and promote Open data.
- Tighten the feedback loop between Open data contributors and consumers.
- Be Open.

[&laquo;&laquo; Use Navigator &raquo;&raquo;](https://www.ogis.org/navigator/)

## Planned Changes

- Implement [debug option](docs/core/1.config.md#debug).
- Worldwide language support.
- Search ([Nominatim](https://nominatim.org/) integration).
- Better handling of denied location permissions.
- Improved offline capabilities ([PWA](https://developer.mozilla.org/docs/Web/Progressive_web_apps) features).
- A developer fiendly plugin system.
- Dark map style.

## Drawbacks and Limitations

I believe the benefits of a web app far outweigh the drawbacks, but it's important to be transparent about the limitations:

- Location permissions are required for GPS/Compass features. Some users have a deny-all approach to web browser permissions and changing permissions varies widely between browsers and devices. _This is a genuine pain point, with not much you can do other than warn and inform the user_

- The app does not work in the background or when the device is locked. _This is a common limitation of web apps, but I want to explore ways to improve this with better caching and PWA features_

- Depending on a single tile provider ([OpenFreeMap](https://openfreemap.org/)) creates a single point of failure. _Their implementation is Open-Source and [self-hosting](https://github.com/hyperknot/openfreemap/blob/main/docs/self_hosting.md) is something I want to persue_

- While the app works well with no internet service, it does require an initial connection to load the app assets and map tiles. _This can be hard to communicate to users and set expectations._

## Thanks Open Source!

| Component          | Source                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Map Data**       | &copy; [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)                                      |
| **Tile Hosting**   | [OpenFreeMap](https://openfreemap.org)                                                                            |
| **Rendering**      | [MapLibre GL JS](https://maplibre.org/)                                                                           |
| **Tile Schema**    | [OpenMapTiles](https://www.openmaptiles.org/) / [OSM Bright](https://github.com/openmaptiles/osm-bright-gl-style) |
| **User Interface** | [Vue JS](https://vuejs.org/) / [Bootstrap](https://getbootstrap.com/)                                             |

## Install

Navigator is [available on npm](https://www.npmjs.com/package/@ogis/navigator) as `@ogis/navigator`. It can be installed with:

```bash
npm install @ogis/navigator
```

## Usage

```js
import Navigator from "@ogis/navigator";
import "@ogis/navigator/navigator.css";

Navigator.create({ id: "my-map" }).mount();
```

`Navigator.create()` looks for a `<div id="my-map">` in the DOM. If one does not exist it is created and appended to `<body>`.

### Options

```js
const nav = Navigator.create({
  id: "my-map", // DOM element id to mount into (created if absent); defaults to 'navigator'
  locale: "fr", // default language; uses browser language if omitted
  messages: {
    // override any UI label for any language
    en: { "about.title": "My Map" },
    fr: { "about.title": "Ma carte" },
  },
  mapOptions: {
    // passed directly to the MapLibre Map constructor
    center: [-128.0094, 50.6539],
    zoom: 12,
  },
  onMapReady: ({ map }) => {
    // called when the map finishes loading
    console.log("Map is ready");
  },
});

nav.mount();
```

See [`docs/core/1.config.md`](docs/core/1.config.md) for the full configuration reference.

### Multiple instances

Each call to `Navigator.create()` creates a fully isolated instance with its own map, UI state, and localStorage namespace.

```js
Navigator.create({
  id: "map-a",
  mapOptions: { center: [-128.0094, 50.6539], zoom: 10 },
}).mount();
Navigator.create({
  id: "map-b",
  mapOptions: { center: [-128.0094, 50.6539], zoom: 14 },
}).mount();
```

See [`docs/core/2.instances.md`](docs/core/2.instances.md) for full details.

## PWA

The Navigator demo is installable as a Progressive Web App (PWA) on supported browsers and devices. When visited in a compatible browser, users will be prompted to add it to their home screen for a full-screen, app-like experience.

The demo includes:

- A [Web App Manifest](public/manifest.json) with icons, name, and display settings
- Optimised viewport meta tags to prevent page-level zoom (map zoom is handled by MapLibre)
- Apple-specific meta tags for iOS home screen installation

## Development

### Document First

Navigator follows a **Document First** development process. Before writing any code, write the documentation for what you're building. Tests and implementation follow from that.

```
Document → Test → Implement → Screenshot
```

**1. Write the documentation** — Start by writing (or updating) the relevant `docs/guide/` file. Describe what the feature does, how to use it, and what developers can expect. If you can't explain it, it probably isn't ready to build.

**2. Write the tests** — Translate each doc heading into a `test.describe` block in the corresponding spec file. If you can't write a test for something, the docs description is too vague — sharpen it first.

**3. Implement until the tests pass** — The docs and tests define the target; the implementation just needs to reach it. Run `npm test -- tests/e2e/{relevant}.spec.js` to track progress. See [docs/core/7.testing.md](docs/core/7.testing.md) for how to find the right spec.

**4. Add screenshots to the docs** — For sections where a picture helps, add a screenshot spec in `tests/e2e/screenshots/` and embed the output in the docs. Not every section needs one.

See [docs/core/7.testing.md](docs/core/7.testing.md) for the full testing and screenshot strategy.

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Test

```bash
npm test -- tests/e2e/{spec}.spec.js
```

See [docs/core/7.testing.md](docs/core/7.testing.md) for the testing strategy and how to find the right spec file.

### Build

```bash
npm run build
```

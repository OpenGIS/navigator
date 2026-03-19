# Navigator

Use your device location and compass to see where you are, anywhere in the world.

![App Preview](assets/screenshots/app-preview.png)

**[&laquo;&laquo; View the Demo &raquo;&raquo;](https://opengis.github.io/Navigator/)**

## Thanks Open Source!

| Component        | Source                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Vector Tiles** | [OpenFreeMap](https://openfreemap.org)                                                                            |
| **Rendering**    | [MapLibre GL JS](https://maplibre.org/) / [Waymark JS](https://github.com/OpenGIS/Waymark-JS/tree/3.0-alpha)      |
| **Tile Schema**  | [OpenMapTiles](https://www.openmaptiles.org/) / [OSM Bright](https://github.com/openmaptiles/osm-bright-gl-style) |
| **Data**         | [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)                                             |

## Usage

```javascript
import Navigator from "@ogis/navigator";
import "@ogis/navigator/navigator.css";

// Initialize the navigator
const navApp = Navigator.init({
  el: "#app", // Target element selector
  debug: false, // Optional: Enable debug mode
  mapOptions: {}, // Optional: Pass options to map
});
```

## Development

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
npm test
```

### Build

```bash
npm run build
```

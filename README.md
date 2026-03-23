# Navigator

Use your device location and compass to see where you are, anywhere in the world.

![App Preview](assets/screenshots/app-preview.png)

**[&laquo;&laquo; View the Demo &raquo;&raquo;](https://www.ogis.org/navigator/)**

## Thanks Open Source!

| Component        | Source                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Vector Tiles** | [OpenFreeMap](https://openfreemap.org)                                                                            |
| **Rendering**    | [MapLibre GL JS](https://maplibre.org/)                                                                           |
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

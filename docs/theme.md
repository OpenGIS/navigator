# Theme

Navigator ships with a custom Bootstrap 5.3 theme built in SCSS. The theme uses a _cartographic_ design philosophy — the UI is intentionally muted and translucent so it blends with the map rather than competing with it.

---

## How it works

`src/assets/sass/theme.scss` is the single source of truth for Navigator's visual style. It:

1. Imports Bootstrap's Sass functions
2. Declares a small palette of variables that override Bootstrap's defaults
3. Imports the full Bootstrap component set (so every component inherits the palette)
4. Applies Navigator-specific overrides for the navbar, panel, tabs, and form elements

The compiled CSS is exported as `dist/navigator.css` and re-exported via the package `"style"` field, so library consumers can import it directly.

---

## Design principles

| Principle           | Implementation                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Map-native**      | Panel and navbar use `backdrop-filter: blur` so the map bleeds through                                                   |
| **Global neutral**  | The palette avoids culturally loaded hues; blue/sand/slate read well across scripts and regions                          |
| **Compact**         | `font-size-base` is set to 15 px — one step smaller than the 16 px browser default — for a tighter, annotation-like feel |
| **Dark-mode ready** | Bootstrap 5.3's `data-bs-theme="dark"` system is fully supported; Navigator-specific overrides include dark variants     |

---

## Customising the palette

Open `src/assets/sass/theme.scss` and edit the four palette variables in **§2**:

```scss
$navigator-blue: #4a8dc8; // primary accent (links, active buttons, focus rings)
$navigator-navy: #0e1423; // always-dark navbar background
$navigator-sand: #f5f3ee; // light-mode panel background
$navigator-slate: #1e2533; // light-mode body text
```

These feed into Bootstrap's variable system, so changing them automatically recolours buttons, links, badges, focus rings, and more.

---

## Customising Bootstrap variables

Any Bootstrap 5.3 variable can be overridden in **§3**, between the functions import and the infrastructure imports. The correct order is mandatory:

```scss
@import "bootstrap/scss/functions"; // §1 — must be first

// §2 + §3 — your overrides go here
$primary: #your-color;
$body-bg: #your-bg;
$font-size-base: 0.9375rem;

@import "bootstrap/scss/variables"; // §4 — must follow overrides
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";

// §5 — Bootstrap components
// §6 — Navigator component overrides
```

A full list of available variables is in [`node_modules/bootstrap/scss/_variables.scss`](../node_modules/bootstrap/scss/_variables.scss).

---

## Component-specific overrides (§6)

The overrides in §6 target Navigator's own CSS classes. Each section is documented inline:

### §6a — Top navigation bar (`.navigator-top .navbar`)

The navbar is always rendered with `data-bs-theme="dark"` so it stays a consistent dark anchor in both light and dark colour modes. Its frosted-glass treatment uses `backdrop-filter: blur` to let the map palette bleed through.

```scss
.navigator-top .navbar {
  background: rgba($navigator-navy, 0.88) !important;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
```

### §6b — Side panel (`.navigator-panel`)

The offcanvas panel uses a semi-transparent background so the map remains perceptible through the UI. A `box-shadow` creates the sense of depth without a hard edge.

```scss
.navigator-panel {
  --bs-offcanvas-bg: rgba(247, 245, 240, 0.94);
  backdrop-filter: blur(18px) saturate(160%);
  …
}

[data-bs-theme="dark"] .navigator-panel {
  --bs-offcanvas-bg: rgba(14, 20, 36, 0.92);
  …
}
```

To change the panel width, override the Bootstrap variable:

```scss
$offcanvas-horizontal-width: 400px; // default Navigator value: 340 px
```

### §6c — Panel navigation tabs (`.panel-nav`)

The sticky tab row at the top of the panel. Slightly more opaque than the panel body so it visually anchors the active section label.

### §6d — Panel content sections (`.sidebar-section.border-top`)

Rows within panels are separated by a featherlight border. Override the opacity to increase or decrease contrast.

### §6e — Icon buttons (`.icon-btn`)

Inactive icons use `--bs-secondary-color`; the **active panel** (`[aria-pressed="true"]`) and hover state both transition to `--bs-primary`. The 0.15 s ease avoids jarring state snaps.

> **Important:** The `[aria-pressed="true"]` active rule **must** live in §6e (the visual overrides section). Do not rely on §6g for this — §6g is structural-only and may be overridden. Custom themes that omit `&[aria-pressed="true"]` from §6e will have no visible active panel indicator.

### §6f — Share URL textarea (`.navigator-share-textarea`)

The share link textarea is styled as ambient display content rather than an editable form field: subdued text colour, tertiary background, and a gentle focus ring on interaction.

---

## Using a custom theme as a library consumer

Navigator is distributed with its compiled CSS (`dist/navigator.css`). To apply your own theme:

1. **Do not import** `@ogis/navigator/navigator.css`.
2. Create your own SCSS file following the same structure — Bootstrap functions → overrides → Bootstrap components → Navigator overrides (§6a–§6f) → Navigator layout styles (§6g).
3. **Import MapLibre GL JS CSS** separately in your application entry point — it is not part of Bootstrap and must always be loaded regardless of which theme you use.
4. Import your SCSS file in your application entry point instead of `navigator.css`.

```js
// main.js
import "maplibre-gl/dist/maplibre-gl.css"; // MapLibre GL JS — required for the map
import Navigator from "@ogis/navigator";
import "./my-theme.scss"; // your custom theme — no navigator.css import

Navigator.init({ id: "map" });
```

Your SCSS file should include Bootstrap, Navigator's visual overrides (§6a–§6f), **and** Navigator's layout styles (§6g). The layout styles in §6g are structural — they position the map, top bar, panel, and icon buttons correctly. Copy them verbatim; they do not depend on palette variables.

```scss
// my-theme.scss
@import "bootstrap/scss/functions";

$primary: #your-brand-color;
// … other overrides …

@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/root";

// Full Bootstrap
@import "bootstrap/scss/reboot";
// … (see src/assets/sass/theme.scss §5 for the full list)

// Navigator visual overrides (§6a–§6f)
// Repeat §6a–§6f from src/assets/sass/theme.scss, adjusted for your palette.

// Navigator layout styles (§6g) — copy verbatim, no palette changes needed
// Repeat §6g from src/assets/sass/theme.scss unchanged.
```

> **Tip:** Copy `src/assets/sass/theme.scss` into your project as a starting point and edit the palette variables in §2. Everything else will cascade automatically.

---

## Example themes

Ready-to-use theme files live in [`docs/theme/`](theme/). Each file is a complete, standalone SCSS theme — copy it into your project and import it as described above.

### Green (`docs/theme/green.scss`)

A dark-navbar, green-accent theme inspired by GPS and trail-mapping apps. The top bar is near-black (`#111111`), the primary accent is a vivid GPS-marker green (`#39d353`), and the panel uses a translucent white/dark background so the map remains perceptible through the UI in both light and dark modes.

**Palette**

| Variable      | Value     | Role                                          |
| ------------- | --------- | --------------------------------------------- |
| `$nav-green`  | `#39d353` | Primary accent — links, active states, focus  |
| `$nav-black`  | `#111111` | Top bar background (near-black)               |
| `$nav-white`  | `#ffffff` | Light-mode panel base                         |
| `$nav-ink`    | `#1a1f1a` | Body text in light mode                       |

**Quick start**

1. Copy `docs/theme/green.scss` into your project (e.g. `src/green-theme.scss`).
2. Do **not** import `@ogis/navigator/navigator.css`.
3. Import MapLibre GL JS CSS and the theme file in your entry point:

```js
// main.js
import "maplibre-gl/dist/maplibre-gl.css"; // MapLibre GL JS — required for the map
import Navigator from "@ogis/navigator";
import "./green-theme.scss";

Navigator.init({ id: "map" });
```

4. To adjust colours, edit the four palette variables at the top of the file (§2). Everything else cascades automatically.

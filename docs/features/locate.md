# Locate

The Locate feature shows the user's current position on the map as a live marker and optionally keeps the map centred as they move. It uses the browser [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) and [DeviceOrientation API](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) for heading.

---

## Locate button

The Locate button sits in the right slot of the top navigation bar. It has four visual states that reflect the current locate mode.

| State | Icon | Label | Meaning |
|-------|------|-------|---------|
| **Inactive** | White crosshairs | Locate | Location is off |
| **Active** | Primary crosshairs | Located | Position is shown on the map; map does not follow |
| **Following** | Primary crosshairs-with-lock | Following | Position is shown and the map re-centres on every position update |
| **Error** | Error-colour crosshairs | Error | Permission was denied or a geolocation error occurred |

> Icons are sourced from the SVG sprite. Placeholder icons are used until the sprite is implemented.

| Inactive | Active | Following | Error |
|----------|--------|-----------|-------|
| ![Inactive](../../assets/screenshots/docs/features/locate/button-inactive.png) | ![Active](../../assets/screenshots/docs/features/locate/button-active.png) | ![Following](../../assets/screenshots/docs/features/locate/button-following.png) | ![Error](../../assets/screenshots/docs/features/locate/button-error.png) |

### Cycling through states

Clicking the button cycles through the active states:

```
Inactive → Active → Following → Inactive → …
```

The Error state is not part of the cycle. Clicking the Error button re-opens the [permission denied modal](#permission-denied).

---

## Permission flow

Geolocation permission, once denied in a browser, is difficult to re-grant — particularly on mobile. To protect against accidental denial, the feature tracks whether the user has ever successfully shared their location, using `useStorage`.

### Storage key

```
navigator_locate_{instanceId}
```

The stored object shape:

```json
{ "permissionGranted": false }
```

`permissionGranted` is set to `true` the first time the browser returns a successful position fix and is never reset by the feature itself.

### First-time use (no stored grant)

When `permissionGranted` is `false` and the user presses Locate:

1. A **confirmation modal** is displayed explaining that the browser will ask for location access.
2. The user must press **"Allow location access"** to proceed. Dismissing the modal without confirming takes no action.
3. After confirmation, the browser's native permission prompt fires. Where supported, the feature requests location and orientation in a single prompt.
4. On success, `permissionGranted` is written to storage and the confirmation modal is never shown again for this instance.

### Returning use (stored grant)

When `permissionGranted` is `true`, pressing Locate goes straight to the Geolocation API — no confirmation modal is shown.

---

## Confirmation modal

Shown the first time the user presses Locate (before the browser prompt).

**Title:** Permission Required

**Body:** To display your current location and compass heading, this app needs your permission. When prompted, please allow location and compass access.

**Actions:**
- **I Understand** (primary button) — proceeds to the browser prompt
- **Cancel** (secondary / close) — dismisses the modal, no action taken

![Confirmation modal](../../assets/screenshots/docs/features/locate/confirmation-modal.png)

---

## Permission denied modal

Shown when the Geolocation API returns a `PERMISSION_DENIED` error. Also shown when the user clicks the Locate button while in the Error state.

**Title:** Location access denied

**Body:** Your browser has blocked location access for this page. To re-enable it:

- **Chrome / Edge (desktop):** Click the lock icon in the address bar → Site settings → Location → Allow.
- **Firefox (desktop):** Click the lock icon → Clear permission → reload the page and try again.
- **Safari (desktop/iOS):** Settings → Privacy & Security → Location Services → find your browser and set to "While Using".
- **Android Chrome:** Settings → Site settings → Location → find this site and allow it.

**Actions:**
- **Close** — dismisses the modal

> The `permissionGranted` storage flag is not affected by a denial — it only becomes `true` on a successful fix.

![Permission denied modal](../../assets/screenshots/docs/features/locate/permission-denied-modal.png)

---

## Map marker

Once the user's position is known, a live marker is rendered on the map.

### Position marker

A crosshairs icon centred on the user's current `lat`/`lng` coordinate. The marker updates whenever a new position fix arrives.

![Position marker](../../assets/screenshots/docs/features/locate/marker-position.png)

### Heading marker

If the device provides a compass bearing via the [`DeviceOrientationEvent`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) API, a separate heading indicator icon is rendered at the same position, rotated to match the bearing. The bearing is smoothed with a low-pass filter to prevent jitter from magnetometer noise.

![Heading marker](../../assets/screenshots/docs/features/locate/marker-heading.png)

Using `DeviceOrientationEvent` (rather than `GeolocationCoordinates.heading`) means the heading indicator is stable at rest — it reflects the compass direction the device is pointing, not the direction it is travelling.

On **iOS Safari (≥ 13)**, `DeviceOrientationEvent.requestPermission()` is called when the user first enables Locate. This fires from the same user-gesture as the geolocation permission request, so it appears as a single browser prompt rather than two separate dialogs.

On **Android** and **desktop** browsers the orientation API is available without an explicit permission grant.

If no orientation data is available (e.g. desktop without a sensor, or permission denied), only the position marker is shown.

---

## Menu alerts and navbar badge

When the locate feature has an active alert, a red `!` badge appears on the sidebar toggle button in the top navigation bar. This signals to the user that the menu contains an actionable message even when the panel is closed.

![Navbar toggle badge showing an alert](../../assets/screenshots/docs/features/locate/navbar-badge.png)

The badge is hidden when there are no active alerts.

### Alert conditions

Two alerts can be active simultaneously. Each appears as a minimal inline alert inside the main menu panel with a **Re-request** button:

| Alert | Condition | Action |
|---|---|---|
| **Location access lost** | Geolocation permission denied or revoked (`mode === 'error'`) | Restarts geolocation watching |
| **Compass unavailable** | Orientation events stopped after an initial successful reading | Re-requests `DeviceOrientationEvent` permission and restarts watching |

The **Re-request** buttons are user-gesture handlers, satisfying the iOS Safari requirement that `DeviceOrientationEvent.requestPermission()` be called within a gesture.

---

## Following mode

When the button is in the **Following** state, the map is re-centred on the user's position each time a new fix arrives. The zoom level is preserved.

Switching to Following from Active uses `map.easeTo()` for a smooth transition to the current position before live tracking begins.

---

## Composable API — `useLocate()`

**File:** `src/features/locate/useLocate.js`

```js
import { useLocate } from '@/features/locate/useLocate';

const { mode, position, start, stop, cycle } = useLocate();
```

### Returned properties

| Name | Type | Description |
|------|------|-------------|
| `mode` | `computed<string\|null>` | Current state: `null` (inactive), `'active'`, `'following'`, or `'error'` |
| `position` | `computed<Position\|null>` | Latest `Position` object, or `null` if unavailable |

### Actions

| Name | Signature | Description |
|------|-----------|-------------|
| `cycle` | `()` | Advance through Inactive → Active → Following → Inactive. Triggers the confirmation modal on first use. Re-opens the error modal when in error state. |
| `start` | `()` | Begin location watching and set mode to `'active'` |
| `stop` | `()` | Stop location watching, remove map marker, set mode to `null` |

### `Position` object

```js
{
  lat: number,             // Latitude
  lng: number,             // Longitude
  heading: number | null,  // Compass bearing (degrees from north), if available
  accuracy: number,        // Accuracy radius in metres
  speed: number | null,    // Ground speed in metres per second, if available
}
```

---

## Persistent state

The composable persists its state using `useStorage('locate', { permissionGranted: false })`. The stored key is `navigator_locate_{instanceId}`.

Only `permissionGranted` is persisted. The active mode is **not** persisted — the locate feature always starts inactive on page load. This avoids the browser silently tracking the user across sessions without a visible affordance.

---

## File structure

```
src/features/locate/
  useLocate.js        ← composable
  panel.vue           ← side panel content (position details)
  button.vue          ← top-bar locate button
src/classes/
  Position.js         ← position data model
```

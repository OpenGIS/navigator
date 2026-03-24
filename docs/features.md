# Adding Features to Navigator

This guide explains how to structure and wire up a new feature in Navigator. The **locate** feature (GPS position tracking) is used throughout as the reference example.

---

## Directory Structure

Each feature lives entirely within its own directory under `src/features/`:

```
src/features/{feature-name}/
  use{Feature}.js   ← composable: state, logic, map integration
  panel.vue         ← side panel content
  button.vue        ← top-bar button (if the feature has one)
```

**Example — locate:**

```
src/features/locate/
  usePosition.js
  panel.vue
  button.vue
```

Supporting data classes belong in `src/classes/` when they are non-trivial objects:

```
src/classes/{Feature}.js   e.g. Position.js
```

---

## 1. The Composable (`use{Feature}.js`)

The composable is the heart of a feature. It owns all state, business logic, and map interaction. It follows the singleton composable pattern: state is declared **outside** the exported function so it is shared across all callers.

### Persistent State with `useStorage`

Use `useStorage` from `@/composables/useStorage` to persist state to `localStorage`. The key written to storage will be `navigator_{namespace}`.

```js
import { useStorage } from "@/composables/useStorage";

// Persisted to localStorage as "navigator_locate"
const state = useStorage("locate", {
  mode: null,
  currentData: null,
});
```

`useStorage` returns a `reactive` object that automatically reads from and writes to `localStorage`.

### Accessing the Map

Interact with the MapLibre map via `useMap()` from `@/core/useMap`. Call it inside a function (not at module top level) to safely access the current map instance:

```js
import { useMap } from "@/core/useMap";

const doSomethingWithMap = () => {
  const { map } = useMap();
  if (!map) return;
  // map.addSource(...), map.addLayer(...), etc.
};
```

If you need to add custom icons, use `addPositionIcons` (or a similar helper in `src/helpers/mapIcons.js`) before adding layers.

### Resuming State on Load

Because state is persisted, check on composable initialisation whether the feature should resume:

```js
if (state.mode && !alreadyRunning) {
  start(); // resume background work
}
```

### Returned API

Return only what consumers need. Wrap state values in `computed()` to expose them as read-only refs:

```js
import { computed } from "vue";

export const useLocate = () => {
  // ...

  return {
    mode: computed(() => state.mode),
    currentData: computed(() => state.currentData),
    start,
    stop,
    cycle,
  };
};
```

**Reference:** `src/features/locate/usePosition.js`

---

## 2. The Panel (`panel.vue`)

The panel is a Vue SFC that is loaded into the shared side panel via `useUI`. It imports its feature's composable directly and uses the returned state to render UI.

```vue
<script setup>
import { useLocate } from "@/features/locate/useLocate";
const { currentData } = useLocate();
</script>

<template>
  <!-- Content rendered inside the side panel offcanvas -->
</template>
```

Panels are not registered globally; they are passed as a component reference to `useUI().openPanel()` or `useUI().togglePanel()` at runtime.

**Reference:** `src/features/locate/panel.vue`

---

## 3. The Button (`button.vue`)

A feature's toolbar button lives at `src/features/{feature-name}/button.vue`. It imports the feature's composable to read state and trigger actions, and uses the shared `Icon` component for its visual.

```vue
<script setup>
import { computed } from "vue";
import { useLocate } from "@/features/locate/useLocate";
import Icon from "@/components/ui/icon.vue";

const { mode, cycle } = useLocate();

const iconName = computed(() => (mode.value === "active" ? "feature-active" : "feature"));
const iconColor = computed(() => (mode.value ? getColour("primary") : "white"));
</script>

<template>
  <a
    href="#"
    class="navbar-nav-link navbar-nav-link-icon rounded-pill"
    :class="{ active: mode }"
    id="locate-button"
    @click="cycle()"
  >
    <Icon width="40" height="40" :fill="iconColor" :name="iconName" />
  </a>
</template>
```

**Reference:** `src/features/locate/button.vue`

---

## 4. Wiring a Feature Into the App

There are two integration points: `App.vue` and `src/components/ui/top.vue`.

### `App.vue`

Import the composable to initialise feature state on load. Import the panel component so it can be registered with the UI:

```js
import { useLocate } from "@/features/locate/useLocate";
import LocatePanel from "@/features/locate/panel.vue";

// Destructure any state that App.vue needs to observe (e.g. for data attributes)
const { mode } = useLocate();

// On desktop, open the panel automatically on first load
if (isDesktop.value) {
  openPanel("locate", LocatePanel);
}
```

The `openPanel(id, component)` and `togglePanel(id, component)` methods come from `useUI()`.

### `src/components/ui/top.vue`

Import the button component and place it in the top navigation bar:

```vue
<script setup>
import LocateButton from "@/features/locate/button.vue";
// ... also import the panel for the sidebar-info toggle if applicable
</script>

<template>
  <nav class="navbar navbar-dark bg-primary">
    <div class="container-fluid">
      <!-- end slot -->
      <ul class="end nav">
        <li class="nav-item mx-1">
          <LocateButton />
        </li>
      </ul>
    </div>
  </nav>
</template>
```

---

## Summary Checklist

When adding a new feature:

1. **Create** `src/features/{feature-name}/use{Feature}.js` — singleton composable with `useStorage` for state, `useMap` for map access, and a clean exported API.
2. **Create** `src/features/{feature-name}/panel.vue` — side panel content that reads from the composable.
3. **Create** `src/features/{feature-name}/button.vue` — top-bar trigger that reads state and calls composable actions.
4. **Create** `src/classes/{Feature}.js` if you need a non-trivial data model.
5. **Wire up** in `App.vue`: initialise the composable and call `openPanel` on desktop load if appropriate.
6. **Wire up** in `src/components/ui/top.vue`: import and render the button component.

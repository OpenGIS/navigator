# Core

The core module provides two composables that every part of the application is built on. Both are instance-aware — they scope their state to the active Navigator instance via `inject('navigatorId')`.

- **[`useMap`](map.md)** — MapLibre GL JS lifecycle management: map creation, view persistence, and URL hash sync.
- **[`useUI`](ui.md)** — Application UI state: responsive breakpoints, the navigation sidebar, and the side panel.

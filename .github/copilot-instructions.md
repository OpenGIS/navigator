# Copilot Instructions for Navigator

## Project Overview

Navigator is a Vue 3 application built with Vite, using MapLibre GL JS directly for mapping with OpenFreeMap as the default tile source.

## Build and Run

- **Development Server:** `npm run dev` (starts Vite dev server)
- **Production Build:** `npm run build` (builds for production)
- **Preview Build:** `npm run preview` (previews the production build locally)
- **Test:** `npm test` (runs E2E tests with Playwright)

## Architecture

- **Entry Point:** `src/index.js` exposes `Navigator.init({ el, debug, mapOptions })` which mounts the Vue app.
- **State Management:**
  - The application uses Vue Composables for state management.
  - Access state and logic through individual composables like `useUI`, `useMap`, and `usePosition`.
- **Map Integration:**
  - The map is powered by MapLibre GL JS with OpenFreeMap `bright` as the default tile style.
  - `useMap(containerRef, options)` manages the full map lifecycle — call it from component setup with a template ref to initialise the map; call without arguments elsewhere to access the current map instance.
  - Map view (center/zoom) is persisted to `navigator_view` in localStorage.
- **Directory Structure:**
  - `src/core`: Core application logic and state management (e.g., `useUI`, `useMap`).
  - `src/features`: Feature-specific logic (e.g., `locate`).
  - `src/classes`: Helper classes for data structures (e.g., `Position`).
  - `src/composables`: Generic, reusable composables (e.g., `useStorage`).
  - `src/helpers`: Utility functions and helpers (e.g., `mapIcons.js` for MapLibre image loading).
  - `src/components`: Vue components, organized by UI or feature.

## Key Conventions

- **Composable Pattern:** Logic is encapsulated in composables. New features should follow this pattern, exposing state and methods via a composable function.
- **Map Handling:** Interact with the map instance through the `useMap` composable to ensure consistent state management.
- **localStorage keys:** `navigator_view` (map center/zoom), `navigator_position` (position state).

## Testing & Screenshots

- **Screenshots:** When creating tests that capture screenshots, always capture the entire application viewport unless a specific component is requested. This provides context for the UI element being tested. Use `page.screenshot({ fullPage: true })` or similar options.

# Copilot Instructions for Navigator

## Project Overview

Navigator is a Vue 3 application built with Vite, integrating `@ogis/waymark-js` for mapping capabilities.

## Build and Run

- **Development Server:** `npm run dev` (starts Vite dev server)
- **Production Build:** `npm run build` (builds for production)
- **Preview Build:** `npm run preview` (previews the production build locally)
- **Test:** `npm test` (runs E2E tests with Playwright)

## Architecture

- **Entry Point:** `src/main.js` is the application entry point. It mounts the Vue application.
- **State Management:**
  - The application uses Vue Composables for state management.
  - Access state and logic through individual composables like `useUI`, `useWaymark`, and `usePosition`.
- **Map Integration:**
  - The map is powered by `@ogis/waymark-js`.
  - The map instance is created in `src/App.vue` and managed via the `useWaymark` composable.
  - Map interactions and state are handled through `useWaymark`.
- **Directory Structure:**
  - `src/core`: Core application logic and state management (e.g., `useUI`, `useWaymark`).
  - `src/features`: Feature-specific logic (e.g., `locate`).
  - `src/classes`: Helper classes for data structures (e.g., `Position`).
  - `src/composables`: Generic, reusable composables (e.g., `useStorage`).
  - `src/helpers`: Utility functions and helpers.
  - `src/components`: Vue components, organized by UI or feature.

## Key Conventions

- **Composable Pattern:** Logic is encapsulated in composables. New features should follow this pattern, exposing state and methods via a composable function.
- **Map Handling:** Interact with the map instance through the `useWaymark` composable to ensure consistent state management.

## Testing & Screenshots

- **Screenshots:** When creating tests that capture screenshots, always capture the entire application viewport unless a specific component is requested. This provides context for the UI element being tested. Use `page.screenshot({ fullPage: true })` or similar options.

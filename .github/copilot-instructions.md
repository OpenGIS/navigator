# Copilot Instructions for Navigator

Full agent context is in [`AGENTS.md`](../AGENTS.md) at the repo root. Read that first.

## GitHub Copilot — additional notes

- `npm test` runs unit tests only (vitest, <1 s). E2E tests run separately via `npm run test:e2e`. Unit tests are the standard final-check before confirming a task done.
- When creating tests that capture screenshots, always use the full viewport (`page.screenshot()` without `fullPage` — the app fills the viewport by design).
- Prefer `expect.poll()` over `waitForTimeout` for async side-effects in tests.
- The demo app uses `id: "app"`, so the localStorage view key in tests is `navigator_view_app`.

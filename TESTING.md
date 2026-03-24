# Testing Strategy

The **Document First** development process is described in the [README](../README.md#document-first). In short: document the behaviour, write tests against the docs, implement until tests pass, then add screenshots where they help.


## Structure

E2E tests mirror the documentation. Each doc file has a corresponding spec file, and each heading in the doc maps to a `test.describe` block in the spec.

| Doc | Spec | Coverage |
|-----|------|----------|
| `docs/instances.md` | `tests/e2e/instances.spec.js` | Instance creation, `id`, `mapOptions`, multiple instances, storage convention |
| `docs/core.md` | `tests/e2e/core.spec.js` | `useMap` lifecycle, view persistence, URL hash, `useUI` panel, breakpoints, first load |

When a new doc file is added (e.g. `docs/4.myfeature.md`), a corresponding `tests/e2e/4.myfeature.spec.js` should be created with a `test.describe` block for each heading.

## Screenshots

Screenshots are captured by Playwright and embedded in documentation for illustration. They live in `tests/e2e/screenshots/` and follow the same numbering as the docs.

| Screenshot spec | Output | Used in |
|-----------------|--------|---------|
| `tests/e2e/screenshots/readme.spec.js` | `assets/screenshots/app-preview.png` | `README.md` |
| `tests/e2e/screenshots/core.spec.js` | `assets/screenshots/docs/core/` | `docs/core.md` |

### Conventions

- One screenshot spec per doc file, numbered to match (e.g. `screenshots/features.spec.js` for `docs/features.md`).
- Screenshots capture the full viewport at **1280×720** (desktop) unless a specific breakpoint is being illustrated.
- Test names describe the UI state being captured (e.g. `"useUI / First load — desktop initial load"`).
- Not every section needs a screenshot — add one when the visual output meaningfully illustrates the behaviour being documented.

### Running screenshot tests

To regenerate all screenshots:

```bash
npx playwright test tests/e2e/screenshots/
```

To regenerate a single file:

```bash
npx playwright test tests/e2e/screenshots/core.spec.js
```

Screenshots are committed to the repository so that docs render correctly in GitHub and npm.

## Initial test view

The standard initial test view used across E2E tests and screenshots is:

```
#map=18/50.653900/-128.009400
```

This is Port Hardy, BC — a recognisable coastal location used in test fixtures, screenshot specs, and the README preview image.

## Running Tests

```bash
npm test
```

This starts the Vite dev server and runs all specs via Playwright (including screenshots).

For interactive / UI mode:

```bash
npx playwright test --ui
```

## Writing Tests

- Create spec files in `tests/e2e/` with the `.spec.js` extension, numbered to match the corresponding doc.
- Name `test.describe` blocks after doc headings (e.g. `"useMap / View persistence"`).
- Use `page.addInitScript` to seed or clear `localStorage` before navigation — this is the reliable way to control app state in tests.
- Storage keys follow the pattern `navigator_{namespace}_{instanceId}`. The demo uses `id: "app"`, so the view key is `navigator_view_app`.
- Poll for async side-effects (e.g. throttled localStorage writes) with `expect.poll()` rather than `waitForTimeout`.

```javascript
import { test, expect } from "@playwright/test";

test.describe("My feature / My heading", () => {
  test("does the thing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".my-element")).toBeVisible();
  });
});
```

## Directory Structure

```
tests/
  e2e/
    instances.spec.js        ← docs/instances.md
    core.spec.js             ← docs/core.md
    screenshots/
      readme.spec.js           ← assets/screenshots/app-preview.png
      core.spec.js           ← assets/screenshots/docs/core/
assets/
  screenshots/
    app-preview.png            ← README.md hero image
    docs/
      core/
        first-load.png
        panel.png
        mobile.png
playwright.config.js
```



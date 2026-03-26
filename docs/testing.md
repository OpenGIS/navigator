# Testing

Tests are Playwright E2E specs. During development, run only the spec relevant to your current work. The full suite takes several minutes — reserve it for a final check before confirming a task is complete.

---

## Running a specific spec

```bash
npm test -- tests/e2e/map.spec.js
```

Replace the path with the spec that corresponds to the doc or feature you are working on. See [Finding the right spec](#finding-the-right-spec) below.

To run a single named test within a spec:

```bash
npm test -- tests/e2e/map.spec.js --grep "View persistence"
```

---

## Finding the right spec

Each doc file has a corresponding spec file. Find the one that covers what you are working on:

| Doc | Spec |
|-----|------|
| `docs/instances.md` | `tests/e2e/instances.spec.js` |
| `docs/map.md` | `tests/e2e/map.spec.js` |
| `docs/ui.md` | `tests/e2e/ui.spec.js` |
| `docs/features/locate.md` | `tests/e2e/features/locate.spec.js` |

Screenshot specs live in `tests/e2e/screenshots/` and mirror the same names.

When you add a new doc, add a corresponding spec file and update this table.

---

## Running all tests (final check only)

Before confirming a task is complete, run the full suite once:

```bash
npm test
```

This starts the Vite dev server and runs all specs via Playwright (including screenshots). Expect it to take several minutes.

Also run the sync check:

```bash
npm run check:sync
```

Both must pass before a task is marked done.

---

## Interactive / UI mode

```bash
npx playwright test --ui
```

---

## Structure

E2E tests mirror the documentation. Each doc file has a corresponding spec, and each heading in the doc maps to a `test.describe` block.

When a new doc file is added (e.g. `docs/4.myfeature.md`), create a corresponding `tests/e2e/4.myfeature.spec.js` with a `test.describe` block for each heading.

---

## Screenshots

Screenshots are captured by Playwright and embedded in documentation. They live in `tests/e2e/screenshots/` and follow the same naming as the docs.

| Screenshot spec | Output | Used in |
|-----------------|--------|---------|
| `tests/e2e/screenshots/readme.spec.js` | `assets/screenshots/app-preview.png` | `README.md` |
| `tests/e2e/screenshots/core.spec.js` | `assets/screenshots/docs/core/` | `docs/core.md` |

To regenerate a single screenshot spec:

```bash
npm test -- tests/e2e/screenshots/core.spec.js
```

Screenshots are committed to the repository so docs render correctly on GitHub and npm.

### Screenshot conventions

- One screenshot spec per doc file, numbered to match (e.g. `screenshots/features.spec.js` for `docs/features.md`).
- Screenshots capture the full viewport at **1280×720** (desktop) unless a specific breakpoint is being illustrated.
- Test names describe the UI state being captured (e.g. `"useUI / First load — desktop initial load"`).
- Not every section needs a screenshot — add one when the visual output meaningfully illustrates the behaviour.

---

## Initial test view

The standard initial test view used across E2E tests and screenshots is:

```
#map=18/50.653900/-128.009400
```

This is Port Hardy, BC — a recognisable coastal location used in test fixtures, screenshot specs, and the README preview image.

---

## Writing Tests

- Create spec files in `tests/e2e/` with the `.spec.js` extension, numbered to match the corresponding doc.
- Name `test.describe` blocks after doc headings (e.g. `"useMap / View persistence"`).
- Use `page.addInitScript` to seed or clear `localStorage` before navigation.
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

---

## Directory Structure

```
tests/
  e2e/
    instances.spec.js        ← docs/instances.md
    map.spec.js              ← docs/map.md
    ui.spec.js               ← docs/ui.md
    features/
      locate.spec.js         ← docs/features/locate.md
    screenshots/
      readme.spec.js         ← assets/screenshots/app-preview.png
      core.spec.js           ← assets/screenshots/docs/core/
assets/
  screenshots/
    app-preview.png          ← README.md hero image
    docs/
      core/
        first-load.png
        panel.png
        mobile.png
playwright.config.js
```

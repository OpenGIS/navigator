# Testing

Navigator has two test layers:

- **Unit tests** (vitest) — test pure composable logic in milliseconds. Run these during development for fast feedback.
- **E2E tests** (Playwright) — test full browser integration. Reserve for final validation.

```bash
npm run test:unit              # vitest — fast, pure logic (<1 s)
npm run test:e2e -- tests/e2e/map.spec.js   # single spec (15–45 s)
npm run test:e2e               # full E2E suite (2–3 min)
npm test                       # both unit + E2E (final check)
```

---

## Unit tests

Unit tests live in `tests/unit/` and cover pure, extractable logic from composables:

| Test file | Composable | What it tests |
|-----------|------------|---------------|
| `tests/unit/useUrlHash.test.js` | `useUrlHash.js` | URL hash parsing and formatting |
| `tests/unit/useLocale.test.js` | `useLocale.js` | Locale resolution, `t()` translation, mapLanguageTag |
| `tests/unit/useSettings.test.js` | `useSettings.js` | `localeDefaultUnits()` locale→unit-system mapping |

Run with vitest:

```bash
npm run test:unit
```

When adding new composable logic, consider whether it can be tested as a pure function. If so, add a unit test in `tests/unit/`.

---

## Running a specific E2E spec

```bash
npm run test:e2e -- tests/e2e/map.spec.js
```

Replace the path with the spec that corresponds to the doc or feature you are working on. See [Finding the right spec](#finding-the-right-spec) below.

To run a single named test within a spec:

```bash
npm run test:e2e -- tests/e2e/map.spec.js --grep "View persistence"
```

---

## Finding the right spec

Each guide doc file has a corresponding E2E spec file. Find the one that covers what you are working on:

| Doc | Spec |
|-----|------|
| `docs/guide/config.md` | `tests/e2e/config.spec.js` |
| `docs/guide/instances.md` | `tests/e2e/instances.spec.js` |
| `docs/guide/core.md` | `tests/e2e/core.spec.js` |
| `docs/guide/map.md` | `tests/e2e/map.spec.js` |
| `docs/guide/ui.md` | `tests/e2e/ui.spec.js` |
| `docs/guide/locale.md` | `tests/e2e/locale.spec.js` |
| `docs/guide/features/locate.md` | `tests/e2e/features/locate.spec.js` |
| `docs/guide/features/settings.md` | `tests/e2e/features/settings.spec.js` |

Screenshot specs live in `tests/e2e/screenshots/` and mirror the same names.

When you add a new doc, add a corresponding spec file and update this table.

---

## Running all tests (final check only)

Before confirming a task is complete, run the full suite once:

```bash
npm test
```

This runs vitest unit tests first, then starts the Vite dev server and runs all Playwright specs (including screenshots). Expect it to take several minutes total.

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

E2E tests mirror the guide documentation. Each guide doc file has a corresponding spec, and each heading in the doc maps to a `test.describe` block.

When a new guide doc file is added (e.g. `docs/guide/myfeature.md`), create a corresponding `tests/e2e/myfeature.spec.js` with a `test.describe` block for each heading.

---

## Screenshots

Screenshots are captured by Playwright and embedded in documentation. They live in `tests/e2e/screenshots/` and follow the same naming as the docs.

| Screenshot spec | Output | Used in |
|-----------------|--------|---------|
| `tests/e2e/screenshots/readme.spec.js` | `assets/screenshots/app-preview.png` | `README.md` |
| `tests/e2e/screenshots/core.spec.js` | `assets/screenshots/docs/core/` | `docs/guide/core.md` |
| `tests/e2e/screenshots/map.spec.js` | `assets/screenshots/docs/map/` | `docs/guide/map.md` |
| `tests/e2e/screenshots/ui.spec.js` | `assets/screenshots/docs/ui/` | `docs/guide/ui.md` |
| `tests/e2e/screenshots/locale.spec.js` | `assets/screenshots/docs/locale/` | `docs/guide/locale.md` |
| `tests/e2e/screenshots/features/locate.spec.js` | `assets/screenshots/docs/features/locate/` | `docs/guide/features/locate.md` |

To regenerate a single screenshot spec:

```bash
npm run test:e2e -- tests/e2e/screenshots/core.spec.js
```

Screenshots are committed to the repository so docs render correctly on GitHub and npm.

### Screenshot conventions

- One screenshot spec per doc file (e.g. `screenshots/features.spec.js` for `docs/features.md`).
- Screenshots capture the full viewport at **1280×720** (desktop) unless a specific breakpoint is being illustrated.
- Test names describe the UI state being captured (e.g. `"useUI / First load — desktop initial load"`).
- Not every section needs a screenshot — add one when the visual output meaningfully illustrates the behaviour.

---

## Initial test view

The standard initial test view used across E2E tests and screenshots is:

```
#map=18/50.653900/-128.009400
```

This is Holberg, BC (Scarlet Ibis Pub) — a recognisable coastal location used in test fixtures, screenshot specs, and the README preview image.

---

## Writing Tests

- Create spec files in `tests/e2e/` with the `.spec.js` extension, named to match the corresponding doc.
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
  unit/
    useUrlHash.test.js       ← src/composables/useUrlHash.js
    useLocale.test.js        ← src/composables/useLocale.js
    useSettings.test.js      ← src/composables/useSettings.js
  e2e/
    config.spec.js           ← docs/guide/config.md
    instances.spec.js        ← docs/guide/instances.md
    core.spec.js             ← docs/guide/core.md
    map.spec.js              ← docs/guide/map.md
    ui.spec.js               ← docs/guide/ui.md
    locale.spec.js           ← docs/guide/locale.md
    features/
      locate.spec.js         ← docs/guide/features/locate.md
      settings.spec.js       ← docs/guide/features/settings.md
    screenshots/
      readme.spec.js         ← assets/screenshots/app-preview.png
      core.spec.js           ← assets/screenshots/docs/core/
      map.spec.js            ← assets/screenshots/docs/map/
      ui.spec.js             ← assets/screenshots/docs/ui/
      locale.spec.js         ← assets/screenshots/docs/locale/
      features/
        locate.spec.js       ← assets/screenshots/docs/features/locate/
assets/
  screenshots/
    app-preview.png          ← README.md hero image
    docs/
      core/
        first-load.png
        panel.png
        mobile.png
vitest.config.js
playwright.config.js
```

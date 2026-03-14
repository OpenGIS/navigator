# Testing Strategy

This project uses [Playwright](https://playwright.dev/) for End-to-End (E2E) testing.

## Running Tests

To run the tests, use the following command:

```bash
npm test
```

This will:
1.  Start the Vite development server (if not already running).
2.  Launch the Playwright test runner.
3.  Execute tests in `tests/e2e/`.

To run tests in UI mode (interactive):

```bash
npx playwright test --ui
```

## Writing Tests

-   Create new test files in `tests/e2e/` with the `.spec.js` extension.
-   Use `test` and `expect` from `@playwright/test`.
-   Example:
    ```javascript
    const { test, expect } = require('@playwright/test');

    test('My Feature works', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#my-element')).toBeVisible();
    });
    ```

## Directory Structure

-   `tests/e2e/`: Contains all E2E test files.
-   `playwright.config.js`: Configuration for Playwright.

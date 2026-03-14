import { test, expect } from '@playwright/test';
import path from 'path';

test('locate panel toggle visibility', async ({ page }) => {
  await page.goto('/');

  // Initial state: Panel should be hidden
  // We look for the side panel container. 
  // Based on the code it might not be in DOM if v-if="activePanelId" is false (which is default).
  // Or if it's an offcanvas, it might be in DOM but hidden.
  // The current code has v-if="activePanelId", so initially it should not be attached or visible.
  
  // Wait for app to load
  await page.waitForLoadState('networkidle');

  // Check if panel is visible. 
  // Using a selector that targets the panel content or container.
  // The current panel has id="side-panel".
  const panel = page.locator('#side-panel');
  await expect(panel).toBeHidden();

  // Find the toggle button in the navbar
  const toggleButton = page.locator('.navbar-toggler');
  await expect(toggleButton).toBeVisible();

  // Click the toggle button
  await toggleButton.click();

  // Expect panel to be visible
  await expect(panel).toBeVisible();
  
  // Verify that <panel> tag is NOT present (it should be resolved to div#side-panel)
  const unresolvedPanel = page.locator('panel');
  await expect(unresolvedPanel).toHaveCount(0);

  // Check if the panel content is loaded (LocatePanel)
  // LocatePanel has "Current Location" header based on previous view
  await expect(page.getByText('Current Location')).toBeVisible();

  // Wait for the panel transition to complete (offcanvas animation)
  // This ensures the panel is fully visible before taking the screenshot
  await expect(panel).toHaveCSS('transform', 'none');

  // Take a screenshot of the entire app with the panel open
  const screenshotPath = path.resolve(process.cwd(), 'assets/screenshots/locate-panel.png');
  // Playwright creates directories automatically.
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Click the toggle button again to hide the panel
  // Since we removed the close button inside the panel, we must use the navbar toggle
  await toggleButton.click();

  // Expect panel to be hidden
  await expect(panel).toBeHidden();
});

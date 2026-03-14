import { test, expect } from '@playwright/test';

test.describe('App Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Map is visible', async ({ page }) => {
    const mapContainer = page.locator('#waymark');
    await expect(mapContainer).toBeVisible();
    
    // Wait for canvas to ensure map rendered
    const mapCanvas = mapContainer.locator('canvas');
    await expect(mapCanvas).toBeVisible();
  });

  test('UI is visible and overlaid', async ({ page }) => {
    const topNav = page.locator('#top .navbar');
    await expect(topNav).toBeVisible();

    // Verify z-index to ensure it's on top
    const zIndex = await page.locator('#top').evaluate((el) => {
        return window.getComputedStyle(el).zIndex;
    });
    expect(parseInt(zIndex)).toBeGreaterThan(1); // Map is 1

    // Verify it is not covered by another element
    // We can try to click a button in the nav. If it's covered, this will fail or warn.
    const positionButton = page.locator('nav .end li a'); 
    await expect(positionButton).toBeVisible();
    
    // Check bounding box to ensure it has dimensions
    const box = await topNav.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
        expect(box.height).toBeGreaterThan(0);
        expect(box.width).toBeGreaterThan(0);
    }

    // Verify it is not covered by another element
    // .click({ trial: true }) performs actionability checks including ensuring the element 
    // is not obscured by another element.
    await topNav.click({ trial: true });

    // Verify it has a visible background color so it stands out from the map
    const backgroundColor = await topNav.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
    });
    // Check if background is not transparent (rgba(0, 0, 0, 0))
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(backgroundColor).not.toBe('transparent');
  });
});

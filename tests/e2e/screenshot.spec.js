import { test, expect } from '@playwright/test';
import path from 'path';

test('take homepage screenshot', async ({ page }, testInfo) => {
  // Go to the homepage
  await page.goto('/');

  // Wait for the app to be ready
  await page.waitForLoadState('networkidle');
  
  // A small delay to ensure map tiles might have loaded if networkidle isn't enough
  await page.waitForTimeout(2000);

  // Define the path for the screenshot
  // Use process.cwd() to resolve from project root
  const screenshotPath = path.resolve(process.cwd(), 'assets/screenshots/app-preview.png');
  
  await page.screenshot({ path: screenshotPath, fullPage: true });
});

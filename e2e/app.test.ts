import { test, expect } from '@playwright/test';

test('page loads and shows canvas', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});

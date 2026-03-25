import { test, expect } from '@playwright/test';

test('page loads and shows canvas after name and team selection', async ({ page }) => {
  await page.goto('/');

  // Enter player name
  const nameInput = page.locator('input[type="text"]');
  await expect(nameInput).toBeVisible();
  await nameInput.fill('TestPlayer');
  await page.locator('button:has-text("Continuar")').click();

  // Select a team
  await expect(page.locator('text=Qual é o teu clube favorito?')).toBeVisible();
  await page.locator('button:has-text("FC Porto")').click();

  // Canvas should appear after team selection
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 5000 });
});

test('returning user skips setup and sees canvas', async ({ page }) => {
  // Pre-set localStorage to simulate a returning user
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('gasquiz_player_name', 'ReturnUser');
    localStorage.setItem('gasquiz_favorite_team', 'FC Porto');
  });

  await page.reload();
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 5000 });
});

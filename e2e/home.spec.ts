import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('shows the break countdown section', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /next break/i })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('now-speaking banner is visible with a session title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Now speaking')).toBeVisible();
  const title = page.getByRole('heading', { level: 2 });
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();
});

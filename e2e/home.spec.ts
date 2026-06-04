import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('day agenda is visible with heading and at least 4 entries', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
  const list = page.getByRole('list');
  await expect(list).toBeVisible();
  const items = list.getByRole('listitem');
  await expect(items).toHaveCount(6);
});

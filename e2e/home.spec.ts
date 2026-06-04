import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('day-agenda: shows heading and at least 4 entries in the main slot', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
  const items = page.getByRole('list').filter({ has: page.locator('li') }).locator('li');
  await expect(items).toHaveCount(6);
  // first and last entries are in order
  await expect(items.first()).toContainText('09:00');
  await expect(items.last()).toContainText('16:00');
});

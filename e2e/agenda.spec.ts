import { test, expect } from '@playwright/test';

test('agenda feature renders in the main slot', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
});

test('agenda shows at least 4 session items', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('ul li');
  await expect(items).toHaveCount(6);
});

test('agenda shows session times and titles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Opening Keynote')).toBeVisible();
  await expect(page.getByText('09:00')).toBeVisible();
});

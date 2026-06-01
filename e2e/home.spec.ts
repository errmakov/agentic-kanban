import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('home page shows the agenda section with times and titles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /agenda/i })).toBeVisible();
  await expect(page.getByText('09:00')).toBeVisible();
  await expect(page.getByText(/doors open & coffee/i)).toBeVisible();
  await expect(page.getByText('15:00')).toBeVisible();
  await expect(page.getByText(/wrap-up & open q&a/i)).toBeVisible();
});

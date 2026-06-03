import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('header shows the attendee counter badge', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/watching/)).toBeVisible();
});

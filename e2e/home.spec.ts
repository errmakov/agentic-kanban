import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('header shows the live attendee counter', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByLabel('live viewer count');
  await expect(counter).toBeVisible();
  await expect(counter).toContainText('viewing');
});

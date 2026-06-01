import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('attendee counter is visible in the header on load', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByLabel('Attendees viewing');
  await expect(counter).toBeVisible();
  const text = await counter.textContent();
  const count = parseInt(text ?? '0', 10);
  expect(count).toBeGreaterThanOrEqual(1);
});

test('attendee counter is visible at mobile viewport width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.getByLabel('Attendees viewing')).toBeVisible();
});

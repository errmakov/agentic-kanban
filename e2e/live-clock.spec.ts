import { test, expect } from '@playwright/test';

test('live clock is visible in the header', async ({ page }) => {
  await page.goto('/');
  const clock = page.locator('time').first();
  await expect(clock).toBeVisible();
});

test('live clock displays a time string', async ({ page }) => {
  await page.goto('/');
  // Wait for the clock to hydrate past the placeholder
  await expect(page.locator('time[dateTime]').first()).toBeVisible();
  const dateTime = await page.locator('time[dateTime]').first().getAttribute('dateTime');
  expect(dateTime).toBeTruthy();
  expect(() => new Date(dateTime!).toISOString()).not.toThrow();
});

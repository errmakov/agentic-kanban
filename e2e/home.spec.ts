import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('attendee counter is visible in the header', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header');
  await expect(header).toBeVisible();
  // The counter starts as "—" then resolves to "N watching"
  const counter = header.locator('span').filter({ hasText: /watching|—/ });
  await expect(counter).toBeVisible();
});

test('attendee counter resolves from loading state to a count', async ({ page }) => {
  await page.goto('/');
  const header = page.locator('header');
  // Wait for the counter to show "N watching" (resolves within ~1 s after mount)
  await expect(header.locator('span').filter({ hasText: /watching/ })).toBeVisible({
    timeout: 5000,
  });
});

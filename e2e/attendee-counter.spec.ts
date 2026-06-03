import { test, expect } from '@playwright/test';

test('attendee counter is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/watching/i)).toBeVisible();
});

test('attendee counter shows an emoji and a number', async ({ page }) => {
  await page.goto('/');
  // Wait for the heartbeat to resolve and replace the placeholder
  await expect(page.getByText(/👥\s*\d+\s*watching/)).toBeVisible({ timeout: 15_000 });
});

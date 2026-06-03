import { test, expect } from '@playwright/test';

test('attendee counter shows watching text in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/watching/i)).toBeVisible({ timeout: 15_000 });
});

test('attendee counter shows a number after polling', async ({ page }) => {
  await page.goto('/');
  // Wait for the count to populate (GET fires on mount, resolves quickly)
  await expect(page.getByText(/\d+.*watching/i)).toBeVisible({ timeout: 15_000 });
});

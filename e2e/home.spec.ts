import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('shows the attendee counter in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/\d+ viewing/i)).toBeVisible();
});

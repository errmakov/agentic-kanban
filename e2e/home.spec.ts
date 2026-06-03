import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('attendee counter shows watching indicator in header', async ({ page }) => {
  await page.goto('/');
  // The component renders "– watching" immediately as a placeholder before the first API response.
  await expect(page.getByText(/watching/)).toBeVisible();
});

test('speaker bio cards section is visible with names and roles', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText('Grace Hopper')).toBeVisible();
  await expect(page.getByText('Alan Turing')).toBeVisible();
  await expect(page.getByText('Keynote Speaker')).toBeVisible();
});

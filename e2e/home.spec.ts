import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('header shows a live attendee counter', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByText(/viewing/);
  await expect(counter).toBeVisible();
});

test('speaker bio cards section is visible with at least two speaker names', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Speakers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ada Okafor' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mateo Rossi' })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('theme toggle button appears in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /switch to dark theme/i })).toBeVisible();
});

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /switch to dark theme/i });
  await toggle.click();

  await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  const themeDark = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(themeDark).toBe('dark');

  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await expect(page.getByRole('button', { name: /switch to dark theme/i })).toBeVisible();
});

test('chosen theme persists across page reloads (no FOUC)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();

  await page.reload();

  // Inline script must have applied dark before React hydrated — button should already show light.
  await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(theme).toBe('dark');
});

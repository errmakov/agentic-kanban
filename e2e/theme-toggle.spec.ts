import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Start each test with a clean localStorage (light theme)
  await page.evaluate(() => localStorage.removeItem('theme'));
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
});

test('theme toggle button is visible in the header', async ({ page }) => {
  await expect(page.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeVisible();
});

test('clicking the toggle switches to dark theme', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Switch to dark mode' });
  await button.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

test('clicking the toggle twice returns to light theme', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Switch to dark mode' });
  await button.click();
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
});

test('theme choice persists across page reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test('theme toggle button is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeVisible();
});

test('clicking the toggle switches to dark mode', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /switch to dark mode/i });
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
});

test('clicking the toggle twice returns to light mode', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /switch to dark mode/i });
  await toggle.click();
  await page.getByRole('button', { name: /switch to light mode/i }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('theme preference persists across page reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark mode/i }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('OS dark preference is respected on first visit', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await context.close();
});

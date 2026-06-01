import { test, expect } from '@playwright/test';

test('theme toggle button is visible in the header', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /switch to (dark|light) theme/i });
  await expect(toggle).toBeVisible();
});

test('clicking the toggle switches to dark theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /switch to dark theme/i });
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
});

test('clicking the toggle twice returns to light theme', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('chosen theme persists after page reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

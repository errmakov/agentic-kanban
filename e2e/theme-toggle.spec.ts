import { test, expect } from '@playwright/test';

test('theme toggle button appears in the header', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /switch to (dark|light) mode/i });
  await expect(button).toBeVisible();
});

test('clicking the toggle switches to dark mode', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /switch to dark mode/i });
  await button.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
});

test('theme preference persists across page reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark mode/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();

  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
});

test('toggling back to light removes dark class', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark mode/i }).click();
  await page.getByRole('button', { name: /switch to light mode/i }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

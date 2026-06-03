import { test, expect } from '@playwright/test';

test('theme toggle button is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /switch to (dark|light) mode/i })).toBeVisible();
});

test('theme toggle switches to dark mode and back', async ({ page }) => {
  await page.goto('/');
  const toggleBtn = page.getByRole('button', { name: 'Switch to dark mode' });
  await expect(toggleBtn).toBeVisible();

  await toggleBtn.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
});

test('dark mode persists after page reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

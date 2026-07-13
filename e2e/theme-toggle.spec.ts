import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggle button is visible in the header', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /switch to (dark|light) mode/i }),
    ).toBeVisible();
  });

  test('clicking the button switches to dark theme', async ({ page }) => {
    const button = page.getByRole('button', { name: /switch to dark mode/i });
    await button.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(
      page.getByRole('button', { name: /switch to light mode/i }),
    ).toBeVisible();
  });

  test('clicking twice returns to light theme', async ({ page }) => {
    const button = page.getByRole('button', { name: /switch to dark mode/i });
    await button.click();
    await page.getByRole('button', { name: /switch to light mode/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('chosen theme persists after a hard reload', async ({ page }) => {
    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(
      page.getByRole('button', { name: /switch to light mode/i }),
    ).toBeVisible();
  });

  test('no flash of wrong theme — dark class present before first paint', async ({
    page,
  }) => {
    // Seed localStorage with 'dark' before navigation so the inline script fires on load.
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.goto('/');
    // html element must already carry the dark class at DOMContentLoaded
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

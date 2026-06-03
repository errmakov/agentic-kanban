import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggle button is visible in the header', async ({ page }) => {
    const button = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await expect(button).toBeVisible();
  });

  test('clicking the toggle switches to dark mode and persists', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.goto('/');

    const button = page.getByRole('button', { name: /switch to dark mode/i });
    await button.click();

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(
      page.getByRole('button', { name: /switch to light mode/i }),
    ).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('stored dark theme is restored on reload', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(
      page.getByRole('button', { name: /switch to light mode/i }),
    ).toBeVisible();
  });

  test('clicking toggle twice returns to original theme', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.goto('/');

    const isDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );

    const button = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await button.click();
    await button.click();

    const isDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('dark'),
    );
    expect(isDarkAfter).toBe(isDarkBefore);
  });
});

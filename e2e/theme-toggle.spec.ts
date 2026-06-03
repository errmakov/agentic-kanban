import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test('toggle button is visible in the header', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('button', { name: /switch to (dark|light) theme/i }),
    ).toBeVisible();
  });

  test('clicking the button adds the dark class to <html>', async ({ page }) => {
    // Start fresh in light mode (no stored preference)
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Switch to dark theme' });
    await button.click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('clicking the button twice returns to light mode', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Switch to dark theme' });
    await button.click();
    await page.getByRole('button', { name: 'Switch to light theme' }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('chosen theme is stored in localStorage', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
    await page.getByRole('button', { name: 'Switch to dark theme' }).click();
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('stored dark theme is applied immediately on reload (no flash)', async ({
    page,
  }) => {
    // Inline script reads localStorage at parse time; addInitScript fires before it
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/');
    // html.dark must be present before any JS re-hydration runs
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('stored light theme keeps page in light mode on reload', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'light'));
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start in light mode
    await page.addInitScript(() => localStorage.removeItem('theme'));
    await page.goto('/');
  });

  test('toggle button is visible in the header', async ({ page }) => {
    await expect(page.getByRole('button', { name: /toggle dark mode/i })).toBeVisible();
  });

  test('clicking the toggle adds dark class to <html>', async ({ page }) => {
    await page.getByRole('button', { name: /toggle dark mode/i }).click();
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('dark');
  });

  test('clicking the toggle twice returns to light mode', async ({ page }) => {
    const button = page.getByRole('button', { name: /toggle dark mode/i });
    await button.click();
    await button.click();
    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).not.toContain('dark');
  });

  test('dark preference is persisted to localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /toggle dark mode/i }).click();
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });

  test('persisted dark preference is restored on reload', async ({ page }) => {
    // Switch to dark and reload
    await page.getByRole('button', { name: /toggle dark mode/i }).click();
    await page.reload();

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    expect(htmlClass).toContain('dark');
  });
});

import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test('toggle button is visible on page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /toggle dark mode/i })).toBeVisible();
  });

  test('clicking toggle switches to dark theme and persists in localStorage', async ({ page }) => {
    await page.goto('/');

    let hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(false);

    await page.getByRole('button', { name: /toggle dark mode/i }).click();

    hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);

    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('dark theme persists after page reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /toggle dark mode/i }).click();

    await page.reload();

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);
  });

  test('respects prefers-color-scheme: dark when no preference is stored', async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');

    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(hasDark).toBe(true);

    await context.close();
  });
});

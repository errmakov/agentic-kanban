import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('theme toggle button is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /switch to (dark|light) theme/i }),
  ).toBeVisible();
});

test('clicking the toggle switches to dark mode and back', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/dark/);

  const toggle = page.getByRole('button', { name: /switch to dark theme/i });
  await toggle.click();
  await expect(html).toHaveClass(/dark/);

  const toggleBack = page.getByRole('button', { name: /switch to light theme/i });
  await toggleBack.click();
  await expect(html).not.toHaveClass(/dark/);
});

test('chosen theme persists across page reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /switch to dark theme/i }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('defaults to dark mode when prefers-color-scheme is dark and no saved preference', async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await context.close();
});

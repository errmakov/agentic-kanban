import { test, expect } from '@playwright/test';

test('theme toggle button is visible in the header', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
  await expect(toggle).toBeVisible();
});

test('clicking the toggle switches to dark mode', async ({ page }) => {
  await page.goto('/');
  // Ensure we start in light mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  const toggle = page.getByRole('button', { name: /switch to dark mode/i });
  await toggle.click();

  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(isDark).toBe(true);
  await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
});

test('chosen theme persists after page reload', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  // Switch to dark
  await page.getByRole('button', { name: /switch to dark mode/i }).click();
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

  // Reload and verify dark mode is still applied (inline FOUC script)
  await page.reload();
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains('dark'),
  );
  expect(isDark).toBe(true);
  await expect(page.getByRole('button', { name: /switch to light mode/i })).toBeVisible();
});

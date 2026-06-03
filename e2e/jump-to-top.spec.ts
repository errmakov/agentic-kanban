import { test, expect } from '@playwright/test';

test('jump-to-top button is hidden initially', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: /scroll to top/i });
  await expect(button).toBeInViewport();
  await expect(button).toHaveClass(/opacity-0/);
  await expect(button).toHaveClass(/pointer-events-none/);
});

test('jump-to-top button appears after scrolling down', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 400));
  const button = page.getByRole('button', { name: /scroll to top/i });
  await expect(button).toHaveClass(/opacity-100/);
});

test('jump-to-top button scrolls to top when clicked', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 400));
  const button = page.getByRole('button', { name: /scroll to top/i });
  await expect(button).toHaveClass(/opacity-100/);
  await button.click();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBe(0);
});

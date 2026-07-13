import { test, expect } from '@playwright/test';

test.describe('live clock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clock is visible in the header', async ({ page }) => {
    await expect(page.locator('header time')).toBeVisible();
  });

  test('displays time in HH:MM:SS format', async ({ page }) => {
    const timeEl = page.locator('header time');
    await expect(timeEl).toBeVisible();
    const text = await timeEl.textContent();
    expect(text).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  test('updates after one second', async ({ page }) => {
    const timeEl = page.locator('header time');
    const first = await timeEl.textContent();
    await page.waitForTimeout(1100);
    const second = await timeEl.textContent();
    expect(second).not.toBe(first);
  });
});

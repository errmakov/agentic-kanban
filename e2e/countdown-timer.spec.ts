import { test, expect } from '@playwright/test';

test('countdown timer: idle state shows +Countdown button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer: clicking +Countdown reveals the MM:SS form', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await expect(page.getByLabel('Minutes')).toBeVisible();
  await expect(page.getByLabel('Seconds')).toBeVisible();
  await expect(page.getByRole('button', { name: /^start$/i })).toBeVisible();
});

test('countdown timer: Cancel button returns to idle', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await page.getByRole('button', { name: /cancel/i }).click();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer: start a timer and see the running countdown', async ({ page }) => {
  await page.goto('/');

  // Reset any existing timer first
  const resetBtn = page.getByRole('button', { name: /reset/i });
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
  }

  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await page.getByLabel('Minutes').fill('0');
  await page.getByLabel('Seconds').fill('30');
  await page.getByRole('button', { name: /^start$/i }).click();

  // Countdown display should be visible
  await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  // Reset button should appear
  await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();

  // Clean up
  await page.getByRole('button', { name: /reset/i }).click();
});

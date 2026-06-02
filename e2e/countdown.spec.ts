import { test, expect } from '@playwright/test';

test.describe('Countdown', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/countdown', { data: { action: 'reset' } });
  });

  test('shows +Countdown button on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /\+countdown/i })).toBeVisible();
  });

  test('shows MM:SS setup form after clicking +Countdown', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await expect(page.getByLabel(/minutes/i)).toBeVisible();
    await expect(page.getByLabel(/seconds/i)).toBeVisible();
  });

  test('Start is disabled when both inputs are 0', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await expect(page.getByRole('button', { name: /^start$/i })).toBeDisabled();
  });

  test('Start is enabled after entering a non-zero duration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await page.getByLabel(/seconds/i).fill('10');
    await expect(page.getByRole('button', { name: /^start$/i })).toBeEnabled();
  });

  test('Cancel in setup returns to the +Countdown button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('button', { name: /\+countdown/i })).toBeVisible();
  });

  test('starting the timer shows the running countdown and a Reset button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await page.getByLabel(/minutes/i).fill('1');
    await page.getByRole('button', { name: /^start$/i }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText(/^\d{2}:\d{2}$/);
    await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
  });

  test('Reset from running returns to +Countdown button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await page.getByLabel(/minutes/i).fill('1');
    await page.getByRole('button', { name: /^start$/i }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await page.getByRole('button', { name: /reset/i }).click();
    await expect(page.getByRole('button', { name: /\+countdown/i })).toBeVisible();
  });

  test('timer survives a page reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /\+countdown/i }).click();
    await page.getByLabel(/minutes/i).fill('2');
    await page.getByRole('button', { name: /^start$/i }).click();
    await expect(page.getByRole('timer')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('timer')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/countdown', { data: { action: 'reset' } });
});

test('countdown timer shows + Countdown button on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer form opens and closes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await expect(page.getByLabel('Minutes')).toBeVisible();
  await expect(page.getByLabel('Seconds')).toBeVisible();
  await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  await page.getByRole('button', { name: /cancel/i }).click();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer starts and can be reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await page.getByLabel('Minutes').fill('0');
  await page.getByLabel('Seconds').fill('30');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByRole('button', { name: /reset/i })).toBeVisible();
  await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  await page.getByRole('button', { name: /reset/i }).click();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.delete('http://localhost:3000/api/countdown');
});

test('countdown timer form is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder('MM:SS')).toBeVisible();
  await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
});

test('Start button is disabled for invalid input 100:00', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('MM:SS').fill('100:00');
  await expect(page.getByRole('button', { name: /start/i })).toBeDisabled();
});

test('Start button is enabled for maximum valid input 99:59', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('MM:SS').fill('99:59');
  await expect(page.getByRole('button', { name: /start/i })).toBeEnabled();
});

test('starting a countdown shows the running timer and Stop button', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('MM:SS').fill('01:30');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();
  await expect(page.getByPlaceholder('MM:SS')).not.toBeVisible();
});

test('reloading mid-countdown resumes the running timer', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('MM:SS').fill('05:00');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();

  await page.reload();

  await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();
  await expect(page.getByPlaceholder('MM:SS')).not.toBeVisible();
});

test('Stop button returns the UI to the idle form', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('MM:SS').fill('02:00');
  await page.getByRole('button', { name: /start/i }).click();
  await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();

  await page.getByRole('button', { name: /stop/i }).click();
  await expect(page.getByPlaceholder('MM:SS')).toBeVisible();
  await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
});

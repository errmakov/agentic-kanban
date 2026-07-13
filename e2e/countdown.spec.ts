import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.delete('/api/countdown');
});

test('countdown form is visible on the home page when idle', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholderText('MM:SS')).toBeVisible();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeDisabled();
});

test('Start button is enabled only when a valid MM:SS is entered', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholderText('MM:SS');
  const startBtn = page.getByRole('button', { name: /\+ countdown/i });

  await input.fill('00:00');
  await expect(startBtn).toBeDisabled();

  await input.fill('02:30');
  await expect(startBtn).toBeEnabled();
});

test('starting a timer shows the running countdown display', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholderText('MM:SS').fill('00:10');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  const display = page.getByLabel('Time remaining');
  await expect(display).toBeVisible();
  const text = await display.textContent();
  expect(text).toMatch(/^00:\d{2}$/);
});

test('Reset button returns all clients to the idle form', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholderText('MM:SS').fill('00:30');
  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await expect(page.getByLabel('Time remaining')).toBeVisible();

  await page.getByRole('button', { name: /reset/i }).click();
  await expect(page.getByPlaceholderText('MM:SS')).toBeVisible();
});

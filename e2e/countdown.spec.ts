import { test, expect } from '@playwright/test';

test.afterEach(async ({ request }) => {
  await request.post('/api/timer', { data: { action: 'reset' } });
});

test('countdown timer idle state shows + Countdown button', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '+ Countdown' })).toBeVisible();
});

test('clicking + Countdown reveals MM/SS setup form', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await expect(page.getByLabel('Minutes')).toBeVisible();
  await expect(page.getByLabel('Seconds')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
});

test('Start button is disabled when duration is zero', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled();
});

test('entering seconds > 59 shows a validation error', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await page.getByLabel('Seconds').fill('60');
  await expect(page.getByText(/seconds must be between 0 and 59/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeDisabled();
});

test('starting a timer shows the running MM:SS display', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await page.getByLabel('Minutes').fill('1');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
});

test('Reset returns to idle state from running view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await page.getByLabel('Minutes').fill('1');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('button', { name: '+ Countdown' })).toBeVisible();
});

test('page reload while timer is running restores the correct running view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+ Countdown' }).click();
  await page.getByLabel('Minutes').fill('1');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible();

  await page.reload();
  await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible();
});

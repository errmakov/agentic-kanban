import { test, expect } from '@playwright/test';

test.describe('Countdown Timer', () => {
  test.beforeEach(async ({ request }) => {
    // Reset the timer state before each test via the API.
    await request.delete('/api/countdown-timer');
  });

  test('shows the + Countdown button when no timer is active', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '+ Countdown' })).toBeVisible();
  });

  test('opens MM/SS input form after clicking + Countdown', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ Countdown' }).click();
    await expect(page.getByLabel('Minutes')).toBeVisible();
    await expect(page.getByLabel('Seconds')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  test('starts a countdown and shows the running timer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ Countdown' }).click();

    // Set 1 minute 30 seconds
    await page.getByLabel('Minutes').fill('1');
    await page.getByLabel('Seconds').fill('30');
    await page.getByRole('button', { name: 'Start' }).click();

    // Running state: a MM:SS display and Cancel button
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    // The displayed time should be close to 01:30
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  });

  test('cancel button resets the timer to idle', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ Countdown' }).click();
    await page.getByLabel('Minutes').fill('5');
    await page.getByLabel('Seconds').fill('0');
    await page.getByRole('button', { name: 'Start' }).click();

    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('button', { name: '+ Countdown' })).toBeVisible();
  });

  test('timer state persists across a page reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+ Countdown' }).click();
    await page.getByLabel('Minutes').fill('2');
    await page.getByLabel('Seconds').fill('0');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

    // Reload and verify the timer is still running
    await page.reload();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
  });

  test('shows Time\'s up for an already-expired timer on load', async ({ request, page }) => {
    // Directly write an expired timer via API (1ms duration = already done).
    await request.post('/api/countdown-timer', {
      data: { durationMs: 1 },
    });
    // Give the server 50ms so the timestamp is definitely in the past.
    await page.waitForTimeout(50);

    await page.goto('/');
    await expect(page.getByText(/time's up/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  });

  test('Reset button on the finished state returns to idle', async ({ request, page }) => {
    await request.post('/api/countdown-timer', { data: { durationMs: 1 } });
    await page.waitForTimeout(50);
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByRole('button', { name: '+ Countdown' })).toBeVisible();
  });
});

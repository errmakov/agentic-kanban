import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('/api/countdown', {
    data: { action: 'reset' },
  });
});

test('countdown shows +Countdown button in idle state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: '+Countdown' })).toBeVisible();
});

test('countdown form appears on click and can be cancelled', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+Countdown' }).click();
  await expect(page.getByLabel('minutes')).toBeVisible();
  await expect(page.getByLabel('seconds')).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: '+Countdown' })).toBeVisible();
  await expect(page.getByLabel('minutes')).not.toBeVisible();
});

test('countdown starts, shows timer, and resets to idle', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+Countdown' }).click();
  await page.getByLabel('minutes').fill('1');
  await page.getByLabel('seconds').fill('0');
  await page.getByRole('button', { name: 'Start' }).click();

  const timer = page.getByLabel('time remaining');
  await expect(timer).toBeVisible();
  await expect(timer).toHaveText(/^\d{2}:\d{2}$/);

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByRole('button', { name: '+Countdown' })).toBeVisible();
});

test('page reload while running restores the correct remaining time', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '+Countdown' }).click();
  await page.getByLabel('minutes').fill('1');
  await page.getByLabel('seconds').fill('30');
  await page.getByRole('button', { name: 'Start' }).click();

  await expect(page.getByLabel('time remaining')).toBeVisible();

  await page.reload();

  await expect(page.getByLabel('time remaining')).toBeVisible();
  const text = await page.getByLabel('time remaining').textContent();
  expect(text).toMatch(/^\d{2}:\d{2}$/);
  // After reload the timer should be close to but not exceed 1:30
  const [mm, ss] = text!.split(':').map(Number);
  expect(mm * 60 + ss).toBeLessThanOrEqual(90);
  expect(mm * 60 + ss).toBeGreaterThan(0);
});

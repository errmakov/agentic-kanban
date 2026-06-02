import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('countdown timer: + Countdown button is visible', async ({ page, request }) => {
  await request.post('/api/countdown', { data: { action: 'reset' } });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer: full start → running → reset flow', async ({ page, request }) => {
  await request.post('/api/countdown', { data: { action: 'reset' } });
  await page.goto('/');

  await page.getByRole('button', { name: /\+ countdown/i }).click();
  await page.getByLabel('Minutes').fill('0');
  await page.getByLabel('Seconds').fill('30');
  await page.getByRole('button', { name: /^start$/i }).click();

  await expect(page.locator('time')).toBeVisible();
  await expect(page.locator('time')).toHaveText(/^\d{2}:\d{2}$/);

  await page.getByRole('button', { name: /reset/i }).click();
  await expect(page.getByRole('button', { name: /\+ countdown/i })).toBeVisible();
});

test('countdown timer: shows Time\'s up! when timer expires', async ({ page, request }) => {
  await request.post('/api/countdown', {
    data: { action: 'start', durationSeconds: 1 },
  });
  await page.goto('/');
  await expect(page.getByText(/time's up!/i)).toBeVisible({ timeout: 5000 });
  await request.post('/api/countdown', { data: { action: 'reset' } });
});

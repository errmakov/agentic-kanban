import { test, expect } from '@playwright/test';

test.describe('NowSpeakingBanner', () => {
  test.afterAll(async ({ request }) => {
    await request.post('/api/session', { data: { name: '' } });
  });

  test('banner is absent when no session is active', async ({ page, request }) => {
    await request.post('/api/session', { data: { name: '' } });
    await page.goto('/');
    await expect(page.getByText(/now speaking/i)).not.toBeVisible();
  });

  test('banner shows the active session name', async ({ page, request }) => {
    await request.post('/api/session', { data: { name: 'Intro to AI Agents' } });
    await page.goto('/');
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByText('Intro to AI Agents')).toBeVisible();
    await expect(page.getByText(/now speaking/i)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('NowSpeaking banner', () => {
  test.afterEach(async ({ request }) => {
    await request.put('/api/now-speaking', { data: { session: '' } });
  });

  test('banner is hidden when no session is set', async ({ page, request }) => {
    await request.put('/api/now-speaking', { data: { session: '' } });
    await page.goto('/');
    await expect(page.getByRole('status')).not.toBeVisible();
  });

  test('banner shows session name after PUT and persists across reload', async ({ page, request }) => {
    await request.put('/api/now-speaking', { data: { session: 'Agentic Kanban Live Demo' } });
    await page.goto('/');
    const banner = page.getByRole('status');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Agentic Kanban Live Demo');
    await expect(banner).toContainText('Now speaking:');

    // Reload and confirm persistence
    await page.reload();
    await expect(page.getByRole('status')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('Agentic Kanban Live Demo');
  });

  test('banner disappears after session is cleared', async ({ page, request }) => {
    await request.put('/api/now-speaking', { data: { session: 'Some Talk' } });
    await page.goto('/');
    await expect(page.getByRole('status')).toBeVisible();

    await request.put('/api/now-speaking', { data: { session: '' } });
    await page.reload();
    await expect(page.getByRole('status')).not.toBeVisible();
  });
});

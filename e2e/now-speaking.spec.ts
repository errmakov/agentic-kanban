import { test, expect } from '@playwright/test';

test.describe('now-speaking feature', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/now-speaking', { data: { title: '' } });
  });

  test.afterEach(async ({ request }) => {
    await request.post('/api/now-speaking', { data: { title: '' } });
  });

  test('GET /api/now-speaking returns a title string', async ({ request }) => {
    const response = await request.get('/api/now-speaking');
    expect(response.ok()).toBe(true);
    const body = await response.json() as { title: unknown };
    expect(typeof body.title).toBe('string');
  });

  test('POST /api/now-speaking persists the title and GET returns it', async ({ request }) => {
    const post = await request.post('/api/now-speaking', {
      data: { title: 'Workshop: Testing Live' },
    });
    expect(post.ok()).toBe(true);
    expect((await post.json() as { title: string }).title).toBe('Workshop: Testing Live');

    const get = await request.get('/api/now-speaking');
    expect((await get.json() as { title: string }).title).toBe('Workshop: Testing Live');
  });

  test('POST /api/now-speaking with a missing title returns 400', async ({ request }) => {
    const response = await request.post('/api/now-speaking', {
      data: { notATitle: 'oops' },
    });
    expect(response.status()).toBe(400);
  });

  test('banner is visible on the page when a session title is set', async ({ page, request }) => {
    await request.post('/api/now-speaking', { data: { title: 'Live Coding: AI on Stage' } });
    await page.goto('/');
    await expect(page.getByRole('region', { name: /now speaking/i })).toBeVisible();
    await expect(page.getByText('Live Coding: AI on Stage')).toBeVisible();
  });

  test('banner is absent from the page when no session title is set', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('region', { name: /now speaking/i })).not.toBeAttached();
  });
});

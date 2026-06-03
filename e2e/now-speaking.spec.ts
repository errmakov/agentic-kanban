import { test, expect } from '@playwright/test';

test.describe('now-speaking feature', () => {
  // Reset to empty title before/after each test so an explicit title from one
  // test doesn't bleed into the next.  An empty title causes the API to return
  // the default fallback ("Live from the workshop"), so the banner remains
  // visible but shows no session-specific content.
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
    expect((body.title as string).length).toBeGreaterThan(0);
  });

  test('GET /api/now-speaking returns the default title when none is explicitly set', async ({ request }) => {
    const response = await request.get('/api/now-speaking');
    expect((await response.json() as { title: string }).title).toBe('Live from the workshop');
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

  test('banner shows the default title when no explicit session is active', async ({ page }) => {
    // beforeEach has reset to '' — the API falls back to "Live from the workshop"
    await page.goto('/');
    await expect(page.getByRole('region', { name: /now speaking/i })).toBeVisible();
    await expect(page.getByText('Live from the workshop')).toBeVisible();
  });
});

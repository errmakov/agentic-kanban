import { test, expect } from '@playwright/test';

test.describe('now-speaking banner', () => {
  test('shows the session name after it is set via the API', async ({ page, request }) => {
    await request.put('/api/now-speaking', {
      data: { session: 'E2E Test Session' },
    });

    await page.goto('/');
    await expect(page.getByText('E2E Test Session')).toBeVisible();
    await expect(page.getByText(/now speaking/i).first()).toBeVisible();
  });

  test('does not show a banner when no session is set', async ({ page, request }) => {
    const res = await request.get('/api/now-speaking');
    const body = await res.json() as { session: string };

    if (!body.session.trim()) {
      await page.goto('/');
      await expect(page.getByRole('region', { name: /now speaking/i })).not.toBeVisible();
    }
  });
});

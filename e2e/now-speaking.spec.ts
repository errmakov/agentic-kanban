import { test, expect } from '@playwright/test';

test.describe('NowSpeakingBanner', () => {
  test('shows the banner with the session name after a POST', async ({ page, request }) => {
    await request.post('/api/now-speaking', {
      data: { session: 'E2E Keynote' },
    });

    await page.goto('/');

    await expect(page.getByText('E2E Keynote')).toBeVisible();
    await expect(page.getByText(/Now speaking:/i)).toBeVisible();
  });
});

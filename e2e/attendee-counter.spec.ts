import { test, expect } from '@playwright/test';

test('attendee counter badge is visible in the header', async ({ page }) => {
  await page.route('**/api/attendee-counter', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 5 }),
    });
  });

  await page.goto('/');

  const badge = page.getByLabel('People watching the wall');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('watching');
});

test('attendee counter displays a numeric count from the API', async ({ page }) => {
  await page.route('**/api/attendee-counter', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 42 }),
    });
  });

  await page.goto('/');

  await expect(page.getByLabel('People watching the wall')).toContainText('42 watching');
});

test('attendee counter shows placeholder before the first fetch resolves', async ({ page }) => {
  let resolveFetch: () => void;
  const fetchBlocked = new Promise<void>((resolve) => {
    resolveFetch = resolve;
  });

  await page.route('**/api/attendee-counter', async (route) => {
    await fetchBlocked;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 1 }),
    });
  });

  await page.goto('/');

  // Before the response arrives the badge shows the loading placeholder
  await expect(page.getByLabel('People watching the wall')).toContainText('— watching');

  // Unblock the request and confirm the count appears
  resolveFetch!();
  await expect(page.getByLabel('People watching the wall')).toContainText('1 watching');
});

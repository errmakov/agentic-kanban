import { test, expect } from '@playwright/test';

test('day agenda section heading is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
});

test('day agenda section contains at least 4 items', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section').filter({ hasText: /today's agenda/i });
  const items = section.getByRole('listitem');
  await expect(items).toHaveCount(8);
});

test('day agenda displays session times and titles', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section').filter({ hasText: /today's agenda/i });
  await expect(section.getByText('09:00')).toBeVisible();
  await expect(section.getByText('Welcome & Intro')).toBeVisible();
  await expect(section.getByText('14:30')).toBeVisible();
  await expect(section.getByText('Q&A and Wrap-Up')).toBeVisible();
});

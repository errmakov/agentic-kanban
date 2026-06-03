import { test, expect } from '@playwright/test';

test('agenda section heading is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
});

test('all agenda items are visible', async ({ page }) => {
  await page.goto('/');
  for (const text of ['09:00', '09:30', '10:30', '10:45', '11:30']) {
    await expect(page.getByText(text)).toBeVisible();
  }
  for (const title of [
    'Welcome & Intro',
    'Live Coding: Agentic Kanban',
    'Break',
    'Q&A / Demo',
    'Wrap-up',
  ]) {
    await expect(page.getByText(title)).toBeVisible();
  }
});

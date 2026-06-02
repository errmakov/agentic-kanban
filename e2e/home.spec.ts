import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('agenda section is visible with at least 5 sessions', async ({ page }) => {
  await page.goto('/');
  const agenda = page.getByRole('region', { name: /today's agenda/i });
  await expect(agenda).toBeVisible();
  await expect(agenda.getByRole('heading', { name: /today's agenda/i })).toBeVisible();
  const count = await agenda.getByRole('listitem').count();
  expect(count).toBeGreaterThanOrEqual(5);
});

test('each agenda session shows a time and a title', async ({ page }) => {
  await page.goto('/');
  const items = page
    .getByRole('region', { name: /today's agenda/i })
    .getByRole('listitem');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    expect(text).toMatch(/\d{2}:\d{2}/);
    expect(text!.replace(/\d{2}:\d{2}/, '').trim().length).toBeGreaterThan(0);
  }
});

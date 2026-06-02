import { test, expect } from '@playwright/test';

test('agenda section is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /today's agenda/i }),
  ).toBeVisible();
});

test('agenda displays multiple items with times and session names', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('09:00')).toBeVisible();
  await expect(page.getByText(/keynote: building live with agents/i)).toBeVisible();
  const items = page.locator('ol li');
  await expect(items).toHaveCount(6);
});

test('agenda appears below the wall section', async ({ page }) => {
  await page.goto('/');
  const wall = page.getByRole('heading', { name: /welcome to the workshop/i });
  const agenda = page.getByRole('heading', { name: /today's agenda/i });
  const wallY = (await wall.boundingBox())!.y;
  const agendaY = (await agenda.boundingBox())!.y;
  expect(agendaY).toBeGreaterThan(wallY);
});

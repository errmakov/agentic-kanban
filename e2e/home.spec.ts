import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test("home page shows the agenda with heading and items", async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /today's agenda/i }),
  ).toBeVisible();
  await expect(page.getByText(/keynote: building software live with agents/i)).toBeVisible();
  const items = page.getByRole('listitem');
  await expect(items).toHaveCount(6);
});

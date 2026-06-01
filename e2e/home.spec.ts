import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('now speaking banner is visible between header and main content', async ({ page }) => {
  await page.goto('/');
  const banner = page.getByLabel('Now speaking');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(/now speaking/i);
  await expect(banner).toContainText('Agentic Kanban Workshop');
});

import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('reaction bar renders all 5 emoji buttons', async ({ page }) => {
  await page.goto('/');
  const group = page.getByRole('group', { name: 'Emoji reactions' });
  await expect(group).toBeVisible();
  await expect(group.getByRole('button')).toHaveCount(5);
});

test('clicking a reaction button increments its count', async ({ page }) => {
  await page.goto('/');
  const firstButton = page.getByRole('group', { name: 'Emoji reactions' }).getByRole('button').first();
  await expect(firstButton).toBeVisible();

  const countText = await firstButton.locator('span').last().textContent();
  const initialCount = parseInt(countText ?? '0', 10);

  await firstButton.click();

  await expect(firstButton.locator('span').last()).toHaveText(String(initialCount + 1));
});

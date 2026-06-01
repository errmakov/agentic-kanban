import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('emoji reaction bar is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Reactions' })).toBeVisible();
  for (const emoji of ['👍', '❤️', '😂', '🎉', '🤯']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji reaction increments its count', async ({ page }) => {
  await page.goto('/');
  const thumbs = page.getByRole('button', { name: 'React with 👍' });
  await expect(thumbs).toContainText('0');

  await thumbs.click();
  await thumbs.click();
  await expect(thumbs).toContainText('2');
});

test('clicking one emoji does not affect other emoji counts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'React with 😂' }).click();

  for (const emoji of ['👍', '❤️', '🎉', '🤯']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toContainText('0');
  }
  await expect(page.getByRole('button', { name: 'React with 😂' })).toContainText('1');
});

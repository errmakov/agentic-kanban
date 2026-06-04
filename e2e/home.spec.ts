import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('emoji reaction bar renders all five emoji buttons', async ({ page }) => {
  await page.goto('/');
  for (const emoji of ['👍', '❤️', '😂', '🎉', '🤯']) {
    await expect(page.getByRole('button', { name: `React with ${emoji}` })).toBeVisible();
  }
});

test('clicking an emoji button increments its count', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'React with 👍' });
  await button.waitFor({ state: 'visible' });

  const countBefore = parseInt((await button.textContent()) ?? '0', 10);
  await button.click();
  await expect(button).toContainText(String(countBefore + 1));
});

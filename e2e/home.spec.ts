import { test, expect } from '@playwright/test';

test('home page shows the FactoryWall heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'FactoryWall' })).toBeVisible();
});

test('reaction bar shows four emoji buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: 'Reactions' })).toBeVisible();
  await expect(page.getByLabel('React with 👍')).toBeVisible();
  await expect(page.getByLabel('React with ❤️')).toBeVisible();
  await expect(page.getByLabel('React with 🎉')).toBeVisible();
  await expect(page.getByLabel('React with 🤔')).toBeVisible();
});

test('tapping an emoji button increments its count', async ({ page }) => {
  await page.goto('/');
  const thumbsUp = page.getByLabel('React with 👍');
  await thumbsUp.waitFor({ state: 'visible' });

  const before = parseInt(await thumbsUp.textContent() ?? '0', 10);
  await thumbsUp.click();

  await expect(thumbsUp).toHaveText(new RegExp(String(before + 1)));
});

test('header shows a live attendee counter', async ({ page }) => {
  await page.goto('/');
  const counter = page.getByText(/viewing/);
  await expect(counter).toBeVisible();
});

test('speaker bio cards section is visible with at least two speaker names', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Speakers' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ada Okafor' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mateo Rossi' })).toBeVisible();
});

test('footer contains FactoryWall text', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo')).toContainText('FactoryWall');
});

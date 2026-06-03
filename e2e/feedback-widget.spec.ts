import { test, expect } from '@playwright/test';

test('feedback widget shows thumbs up and thumbs down buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /thumbs up/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /thumbs down/i })).toBeVisible();
});

test('clicking thumbs up increments the up count', async ({ page }) => {
  await page.goto('/');
  const upButton = page.getByRole('button', { name: /thumbs up/i });
  await expect(upButton).toBeVisible();

  const countText = upButton.locator('span').last();
  const before = Number(await countText.textContent());

  await upButton.click();

  await expect(countText).toHaveText(String(before + 1));
});

test('clicking thumbs down increments the down count', async ({ page }) => {
  await page.goto('/');
  const downButton = page.getByRole('button', { name: /thumbs down/i });
  await expect(downButton).toBeVisible();

  const countText = downButton.locator('span').last();
  const before = Number(await countText.textContent());

  await downButton.click();

  await expect(countText).toHaveText(String(before + 1));
});

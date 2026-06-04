import { test, expect } from '@playwright/test';

test('speaker bio cards section is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();
});

test('all three speaker cards are rendered', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Alex Rivera')).toBeVisible();
  await expect(page.getByText('Sam Chen')).toBeVisible();
  await expect(page.getByText('Jordan Kim')).toBeVisible();
});

test('each speaker card shows role and bio', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Senior Software Engineer')).toBeVisible();
  await expect(page.getByText('Product Manager')).toBeVisible();
  await expect(page.getByText('DevOps Lead')).toBeVisible();
});

test('each speaker card has thumbs-up and thumbs-down buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /thumbs up for alex rivera/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /thumbs down for alex rivera/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /thumbs up for sam chen/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /thumbs up for jordan kim/i })).toBeVisible();
});

test('clicking thumbs-up increments the count', async ({ page }) => {
  await page.goto('/');
  const upButton = page.getByRole('button', { name: /thumbs up for alex rivera/i });
  await upButton.waitFor({ state: 'visible' });

  const countBefore = parseInt((await upButton.textContent()) ?? '0', 10);
  await upButton.click();
  await expect(upButton).toContainText(String(countBefore + 1));
});

test('clicking thumbs-down increments the down count', async ({ page }) => {
  await page.goto('/');
  const downButton = page.getByRole('button', { name: /thumbs down for sam chen/i });
  await downButton.waitFor({ state: 'visible' });

  const countBefore = parseInt((await downButton.textContent()) ?? '0', 10);
  await downButton.click();
  await expect(downButton).toContainText(String(countBefore + 1));
});

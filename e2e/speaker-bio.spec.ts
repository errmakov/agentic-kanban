import { test, expect } from '@playwright/test';

test('speaker bio section heading is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();
});

test('all four speaker names are displayed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Alex Rivera')).toBeVisible();
  await expect(page.getByText('Priya Nair')).toBeVisible();
  await expect(page.getByText('Sam Okonkwo')).toBeVisible();
  await expect(page.getByText('Maya Chen')).toBeVisible();
});

test('each speaker has thumbs-up and thumbs-down buttons', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /thumbs up/i })).toHaveCount(4);
  await expect(page.getByRole('button', { name: /thumbs down/i })).toHaveCount(4);
});

test('clicking thumbs up increments the count for that speaker', async ({ page }) => {
  await page.goto('/');
  const upButton = page.getByRole('button', { name: /thumbs up for alex rivera/i });
  await upButton.waitFor();
  const before = parseInt((await upButton.textContent() ?? '0').match(/\d+/)?.[0] ?? '0', 10);
  await upButton.click();
  await expect(upButton).toContainText(String(before + 1));
});

test('clicking thumbs down increments the down count for that speaker', async ({ page }) => {
  await page.goto('/');
  const downButton = page.getByRole('button', { name: /thumbs down for priya nair/i });
  await downButton.waitFor();
  const before = parseInt((await downButton.textContent() ?? '0').match(/\d+/)?.[0] ?? '0', 10);
  await downButton.click();
  await expect(downButton).toContainText(String(before + 1));
});

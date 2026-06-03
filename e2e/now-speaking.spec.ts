import { test, expect } from '@playwright/test';

test('now-speaking: edit form is visible on the home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Current session name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
});

test('now-speaking: banner appears after setting a session name', async ({ page }) => {
  await page.goto('/');

  const input = page.getByLabel('Current session name');
  await input.fill('E2E Test Session');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('E2E Test Session')).toBeVisible();
  await expect(page.getByText('Now speaking')).toBeVisible();

  // Clean up: clear the session so it doesn't affect other tests
  await input.fill('');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('E2E Test Session')).not.toBeVisible();
});

test('now-speaking: banner is hidden when session is cleared', async ({ page }) => {
  await page.goto('/');

  const input = page.getByLabel('Current session name');
  await input.fill('Temporary Session');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Temporary Session')).toBeVisible();

  await input.fill('');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/now speaking/i)).not.toBeVisible();
});

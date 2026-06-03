import { test, expect } from '@playwright/test';

test('share button is visible in the header', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Copy link to this session' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy link to this session' })).toContainText('Share');
});

test('clicking share button shows "Copied!" feedback', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const btn = page.getByRole('button', { name: 'Copy link to this session' });
  await btn.click();
  await expect(page.getByRole('button', { name: 'Link copied to clipboard' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Link copied to clipboard' })).toContainText('Copied!');
});

test('share button reverts to "Share" after 2 seconds', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy link to this session' }).click();
  await expect(page.getByRole('button', { name: 'Link copied to clipboard' })).toBeVisible();
  await page.waitForTimeout(2100);
  await expect(page.getByRole('button', { name: 'Copy link to this session' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy link to this session' })).toContainText('Share');
});

test('share button writes the page URL to clipboard', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.getByRole('button', { name: 'Copy link to this session' }).click();
  await expect(page.getByRole('button', { name: 'Link copied to clipboard' })).toBeVisible();
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toBe('http://localhost:3000/');
});

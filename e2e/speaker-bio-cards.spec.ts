import { test, expect } from '@playwright/test';

test.describe('speaker bio cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Speakers section heading is visible on the home page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /speakers/i })).toBeVisible();
  });

  test('renders at least two speaker cards', async ({ page }) => {
    const cards = page.locator('article');
    await expect(cards).toHaveCount(3);
  });

  test('each speaker card shows a name, role, and bio', async ({ page }) => {
    await expect(page.getByText('Ada Marković')).toBeVisible();
    await expect(page.getByText('Host & Pipeline Architect')).toBeVisible();
    await expect(page.getByText(/agentic delivery systems/i)).toBeVisible();

    await expect(page.getByText('Liam Chen')).toBeVisible();
    await expect(page.getByText('Staff Engineer, Developer Tools')).toBeVisible();
    await expect(page.getByText(/AI coding agents/i)).toBeVisible();

    await expect(page.getByText('Sofia Ruiz')).toBeVisible();
    await expect(page.getByText('Product Lead, Live Demos')).toBeVisible();
    await expect(page.getByText(/small, self-contained/i)).toBeVisible();
  });

  test('speaker section appears below the Wall section', async ({ page }) => {
    const wall = page.locator('section').first();
    const speakers = page.getByRole('region', { name: /speakers/i });
    const wallBox = await wall.boundingBox();
    const speakersBox = await speakers.boundingBox();
    expect(wallBox).not.toBeNull();
    expect(speakersBox).not.toBeNull();
    expect(speakersBox!.y).toBeGreaterThan(wallBox!.y);
  });
});

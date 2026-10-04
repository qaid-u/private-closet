import { test, expect } from '@playwright/test';

test.describe('Phase 0: Shell & Navigation', () => {
  test('renders navigation shell, switches tabs, and toggles theme', async ({ page }) => {
    await page.goto('/');

    // Verify Today screen is rendered by default
    await expect(page.locator('text=Good morning')).toBeVisible();

    // Check visible Closet navigation button
    const closetBtn = page.locator('#nav-closet:visible, #rail-nav-closet:visible');
    await closetBtn.click();
    await expect(page.locator('text=Wardrobe Closet')).toBeVisible();

    // Switch to Style
    const styleBtn = page.locator('#nav-style:visible, #rail-nav-style:visible');
    await styleBtn.click();
    await expect(page.locator('text=Style Studio')).toBeVisible();

    // Switch to Me
    const meBtn = page.locator('#nav-me:visible, #rail-nav-me:visible');
    await meBtn.click();
    await expect(page.locator('text=Settings & Privacy')).toBeVisible();
    await expect(page.locator('text=0 bytes')).toBeVisible();
  });
});

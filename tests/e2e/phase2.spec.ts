import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 2: Data Layer, Repositories, Seed Data & AI Models', () => {
  test('verifies Section 9 interactive flows and captures responsive screenshots', async ({ page }) => {
    // 1. Desktop Viewport Light Mode
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:5173/dev/components');

    // Scroll to Section 9
    const section9 = page.locator('#sec-phase2');
    await expect(section9).toBeVisible();
    await section9.scrollIntoViewIfNeeded();

    // Verify initial state
    const loadSampleBtn = page.getByRole('button', { name: /load sample wardrobe/i });
    await expect(loadSampleBtn).toBeVisible();

    // Click Load Sample Wardrobe
    await loadSampleBtn.click();

    // Verify item count updates to 10
    await expect(page.locator('text=Sample closet active (10 items)')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Loaded Cutouts Preview (10)')).toBeVisible();

    // Verify some sample cutout names
    await expect(page.locator('text=Cream knit sweater').first()).toBeVisible();
    await expect(page.locator('text=Navy linen shirt').first()).toBeVisible();
    await expect(page.locator('text=Olive chinos').first()).toBeVisible();

    // Test Model Installation Simulation
    const installBtn = page.getByRole('button', { name: /install model \(simulated\)/i }).first();
    await installBtn.click();
    // Wait for installed badge
    await expect(page.locator('text=Installed').first()).toBeVisible({ timeout: 10000 });

    // Capture Desktop Light Mode screenshot of Section 9
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase2_desktop_light.png'),
      fullPage: false,
    });

    // Toggle to Dark Mode
    const themeToggle = page.getByRole('button', { name: /(dark|light) mode/i }).first();
    await themeToggle.scrollIntoViewIfNeeded();
    await themeToggle.click();

    // Scroll back to Section 9
    await section9.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Capture Desktop Dark Mode
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase2_desktop_dark.png'),
      fullPage: false,
    });

    // 2. Tablet Viewport Dark Mode (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await section9.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase2_tablet_dark.png'),
      fullPage: false,
    });

    // 3. Mobile Viewport Dark Mode (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await section9.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase2_mobile_dark.png'),
      fullPage: false,
    });

    // Toggle back to Light Mode on Mobile
    await themeToggle.scrollIntoViewIfNeeded();
    await themeToggle.click();
    await section9.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase2_mobile_light.png'),
      fullPage: false,
    });

    // Test Remove Sample Wardrobe
    const removeSampleBtn = page.getByRole('button', { name: /remove sample wardrobe/i });
    await removeSampleBtn.click();
    await expect(page.locator('text=No sample items loaded')).toBeVisible({ timeout: 10000 });
  });
});

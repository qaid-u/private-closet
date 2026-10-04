import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 4: Closet, Add Item, Item Detail End-to-End Tests', () => {
  test('tests closet grid, item detail sheet, add item flow, and responsive captures', async ({ page }) => {
    // 1. Initial Launch: Desktop Viewport Light Mode
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      localStorage.setItem('pc_onboarding_done', 'true');
    });
    await page.goto('http://127.0.0.1:5173/');

    // Ensure we are in main app shell
    const closetTabBtn = page.locator('#rail-nav-closet, #nav-closet').first();
    await closetTabBtn.click();

    // Verify Closet Header
    await expect(page.locator('text=Wardrobe Closet')).toBeVisible();

    // Ensure sample closet is seeded if empty
    const itemQuery = page.locator('text=Cream knit sweater').first();
    const sampleBtn = page.getByRole('button', { name: /try with a sample closet/i });
    
    // Wait for either the sample button or an item to appear
    await Promise.race([
      itemQuery.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {}),
      sampleBtn.waitFor({ state: 'visible', timeout: 4000 }).then(async () => {
        if (await sampleBtn.isVisible()) {
          await sampleBtn.click();
        }
      }).catch(() => {})
    ]);

    // Wait for items to be visible in closet
    await expect(page.locator('text=Cream knit sweater').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Navy linen shirt').first()).toBeVisible();

    // Capture Desktop Light Mode Closet Grid
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_closet_desktop_light.png'),
      fullPage: false,
    });

    // Test Item Detail Sheet: Click on "Navy linen shirt"
    const shirtCard = page.locator('text=Navy linen shirt').first();
    await shirtCard.click();

    // Detail sheet should open
    await expect(page.locator('text=Why This Suits You')).toBeVisible();
    await expect(page.locator('text=Times Worn')).toBeVisible();
    await expect(page.locator('text=Cost Per Wear')).toBeVisible();

    // Capture Item Detail Sheet Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_detail_desktop_light.png'),
      fullPage: false,
    });

    // Close detail sheet
    await page.keyboard.press('Escape');

    // Test Add Item Flow: Click "Add item" button
    const addItemBtn = page.getByRole('button', { name: /add item/i }).first();
    await addItemBtn.click();

    // Verify Add Item modal
    await expect(page.locator('text=Add Item to Closet')).toBeVisible();
    await expect(page.locator('text=Frame garment inside outline')).toBeVisible();

    // Capture Add Item Modal Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_additem_desktop_light.png'),
      fullPage: false,
    });

    // Simulate Capture
    const captureBtn = page.getByRole('button', { name: /capture photo \(simulated\)/i });
    await captureBtn.click();

    // Review tags step
    await expect(page.locator('text=AI Tag Suggestions')).toBeVisible({ timeout: 10000 });

    // Continue to details
    const continueBtn = page.getByRole('button', { name: /continue to details/i });
    await continueBtn.click();

    // Save to closet
    await expect(page.locator('text=Item Name')).toBeVisible();
    const saveBtn = page.getByRole('button', { name: /save to closet/i });
    await saveBtn.click();

    // Saved confirmation
    await expect(page.locator('text=Saved to Your Closet!')).toBeVisible({ timeout: 10000 });
    const viewClosetBtn = page.getByRole('button', { name: /view closet/i });
    await viewClosetBtn.click();

    // Test Care View: Click "Care" filter chip
    const careChip = page.getByRole('button', { name: /^care$/i });
    await careChip.click();
    await expect(page.locator('text=Seasonal Rotation Suggestion')).toBeVisible();
    await expect(page.getByRole('heading', { name: /laundry basket/i })).toBeVisible();

    // Switch to Dark Mode
    const themeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Capture Care View Desktop Dark
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_care_desktop_dark.png'),
      fullPage: false,
    });

    // Switch back to "All" items
    const allChip = page.getByRole('button', { name: /^all/i });
    await allChip.click();
    await page.waitForTimeout(300);

    // Capture Closet Desktop Dark
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_closet_desktop_dark.png'),
      fullPage: false,
    });

    // 2. Tablet Viewport (768x1024) Dark Mode
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_tablet_dark.png'),
      fullPage: false,
    });

    // 3. Mobile Viewport (390x844) Dark Mode
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_mobile_dark.png'),
      fullPage: false,
    });

    // Mobile Light Mode
    const mobileThemeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await mobileThemeBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase4_mobile_light.png'),
      fullPage: false,
    });
  });
});

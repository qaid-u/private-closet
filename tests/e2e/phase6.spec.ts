import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 6: Outfit Studio, Lookbook Gallery & Capsule Wardrobe End-to-End Tests', () => {
  test('tests lookbook gallery, outfit studio visual builder, balance review, capsule generator, and responsive captures', async ({ page }) => {
    // 1. Initial Launch: Desktop Viewport Light Mode
    await page.setViewportSize({ width: 1280, height: 800 });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.addInitScript(() => {
      localStorage.setItem('pc_onboarding_done', 'true');
    });
    await page.goto('http://127.0.0.1:5173/');

    // Seed sample closet if empty
    const recQuery = page.locator('text=Recommendation 1 of').first();
    const sampleBtn = page.getByRole('button', { name: /try with a sample closet/i });

    await Promise.race([
      recQuery.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      sampleBtn.waitFor({ state: 'visible', timeout: 5000 }).then(async () => {
        if (await sampleBtn.isVisible()) {
          await sampleBtn.click();
        }
      }).catch(() => {})
    ]);

    // Navigate to Style -> Outfits (Lookbook)
    const styleNavBtn = page.locator('#rail-nav-style');
    await styleNavBtn.click();
    await page.waitForTimeout(300);

    const outfitsTab = page.getByRole('button', { name: /^outfits$/i });
    await outfitsTab.click();
    await page.waitForTimeout(400);

    // Verify Lookbook Gallery is loaded
    await expect(page.getByRole('heading', { name: /saved outfits lookbook/i })).toBeVisible({ timeout: 10000 });

    // If no outfits yet, generate starter looks
    const starterBtn = page.getByRole('button', { name: /generate starter looks/i });
    if (await starterBtn.isVisible()) {
      await starterBtn.click();
      await page.waitForTimeout(500);
    }

    // Verify outfit cards are visible
    await expect(page.locator('text=Looks').first()).toBeVisible();

    // 1. Capture Desktop Light Mode Lookbook
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_lookbook_desktop_light.png'),
      fullPage: false,
    });

    // 2. Open Outfit Studio
    const buildOutfitBtn = page.getByRole('button', { name: /build outfit/i }).first();
    await buildOutfitBtn.click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: /outfit studio/i })).toBeVisible();
    await expect(page.locator('text=Add Top')).toBeVisible();

    // Choose top garment from drawer
    const addTopSlot = page.locator('text=Add Top').first();
    await addTopSlot.click();
    await page.waitForTimeout(200);

    const firstTopUse = page.getByRole('button', { name: /use/i }).first();
    await firstTopUse.click();
    await page.waitForTimeout(300);

    // Switch drawer to bottom and pick a bottom piece
    const bottomTab = page.getByRole('button', { name: /^bottom$/i }).first();
    await bottomTab.click();
    await page.waitForTimeout(300);

    const firstBottomUse = page.getByRole('button', { name: /use/i }).first();
    await firstBottomUse.click();
    await page.waitForTimeout(300);

    // 2. Capture Desktop Light Mode Outfit Studio
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_studio_desktop_light.png'),
      fullPage: false,
    });

    // 3. Test Check Balance
    const checkBalanceBtn = page.getByRole('button', { name: /check balance/i });
    await checkBalanceBtn.click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: /outfit balance check/i })).toBeVisible();
    await expect(page.locator('text=Harmony Score')).toBeVisible();
    await expect(page.getByText('Color Harmony', { exact: true })).toBeVisible();

    // 3. Capture Check Balance Modal
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_check_desktop_light.png'),
      fullPage: false,
    });

    // Close check balance modal
    const looksGreatBtn = page.getByRole('button', { name: /looks great/i });
    await looksGreatBtn.click();
    await page.waitForTimeout(300);

    // 4. Save Outfit to Lookbook
    const saveOutfitBtn = page.getByRole('button', { name: /save outfit/i });
    await saveOutfitBtn.click();
    await page.waitForTimeout(300);

    await expect(page.getByRole('heading', { name: /save outfit to lookbook/i })).toBeVisible();
    const confirmSaveBtn = page.getByRole('button', { name: /save to lookbook/i });
    await confirmSaveBtn.click();
    await page.waitForTimeout(400);

    // 5. Open Capsule Creator
    const capsuleStudioBtn = page.getByRole('button', { name: /capsule studio/i });
    await capsuleStudioBtn.click();
    await page.waitForTimeout(400);

    await expect(page.getByRole('heading', { name: /capsule wardrobe studio/i })).toBeVisible();
    await expect(page.locator('text=Versatility Index')).toBeVisible();
    await expect(page.locator('text=Capsule Pairing Matrix')).toBeVisible();

    // 5. Capture Capsule Studio Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_capsule_desktop_light.png'),
      fullPage: false,
    });

    // Back to Lookbook gallery
    const backBtn = page.getByRole('button', { name: /back/i }).first();
    await backBtn.click();
    await page.waitForTimeout(300);

    // 6. Switch to Dark Mode on Desktop
    const themeBtn = page.getByRole('button', { name: /switch to dark mode/i });
    await themeBtn.click();
    await page.waitForTimeout(400);

    // 6. Capture Desktop Dark Lookbook
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_lookbook_desktop_dark.png'),
      fullPage: false,
    });

    // 7. Tablet Viewport Dark Mode (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_tablet_dark.png'),
      fullPage: false,
    });

    // 8. Mobile Viewport Dark Mode (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_mobile_dark.png'),
      fullPage: false,
    });

    // 9. Mobile Viewport Light Mode (390x844)
    const mobileThemeBtn = page.getByRole('button', { name: /switch to light mode/i });
    await mobileThemeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase6_mobile_light.png'),
      fullPage: false,
    });
  });
});

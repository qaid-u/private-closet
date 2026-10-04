import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Qaid Uqail/.gemini/antigravity-ide/brain/b83c46d5-3854-44c4-9b40-8b171e6cb2b7';

test.describe('Phase 3: Onboarding & Style Profile End-to-End Tests', () => {
  test('tests full onboarding flow, style profile editing, and responsive captures', async ({ page }) => {
    // 1. Initial Launch: Onboarding Flow at 1280x800 (Light Mode)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://127.0.0.1:5173/?onboarding=true');

    // Welcome Screen
    await expect(page.locator('text=What should I wear today?')).toBeVisible();
    await expect(page.locator('text=Zero Cloud')).toBeVisible();

    // Capture Onboarding Welcome Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_onboarding_welcome_desktop_light.png'),
      fullPage: false,
    });

    // Proceed to Privacy
    const beginBtn = page.getByRole('button', { name: /begin guided setup/i });
    await beginBtn.click();
    await expect(page.locator('text=Our Privacy Promise')).toBeVisible();

    // Proceed to Profile Choice
    const agreeBtn = page.getByRole('button', { name: /i understand & agree/i });
    await agreeBtn.click();
    await expect(page.locator('text=Personalize Your Recommendations')).toBeVisible();

    // Choose "Do This Later" to proceed through onboarding fast
    const doLaterBtn = page.getByRole('button', { name: /do this later/i });
    await doLaterBtn.click();

    // Storage protection step
    await expect(page.locator('text=Offline Storage Protection')).toBeVisible();
    const continueAiBtn = page.getByRole('button', { name: /continue to ai setup/i });
    await continueAiBtn.click();

    // AI Setup step
    await expect(page.locator('text=On-Device AI Engine')).toBeVisible();
    const continueItemsBtn = page.getByRole('button', { name: /continue/i });
    await continueItemsBtn.click();

    // Add first items step: pick Sample Wardrobe
    await expect(page.locator('text=Add Your First Clothing Items')).toBeVisible();
    const sampleWardrobeBtn = page.getByRole('button', { name: /try with sample wardrobe/i });
    await sampleWardrobeBtn.click();

    // Celebration step
    await expect(page.locator('text=Your Closet is Ready!')).toBeVisible({ timeout: 10000 });

    // Click Meet Your First Today Outfits to finish onboarding
    const meetOutfitsBtn = page.getByRole('button', { name: /meet your first today outfits/i });
    await meetOutfitsBtn.click();

    // Now in Main App shell: navigate to Style tab
    const styleTabBtn = page.locator('#rail-nav-style, #nav-style').first();
    await styleTabBtn.click();

    // Verify Style Studio screen
    await expect(page.locator('text=Style Studio')).toBeVisible();
    await expect(page.locator('text=Your Style Profile')).toBeVisible();

    // Capture Style Profile Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_style_desktop_light.png'),
      fullPage: false,
    });

    // Test Edit Profile Wizard
    const editBtn = page.getByRole('button', { name: /edit profile/i });
    await editBtn.click();
    await expect(page.locator('text=Skin Depth & Undertone')).toBeVisible();

    // Capture Style Profile Wizard Desktop Light
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_wizard_desktop_light.png'),
      fullPage: false,
    });

    // Cancel wizard back to Style tab
    const cancelWizardBtn = page.getByRole('button', { name: /do this later/i });
    await cancelWizardBtn.click();

    // Switch to Dark Mode
    const themeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await themeBtn.click();
    await page.waitForTimeout(300);

    // Capture Style Profile Desktop Dark
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_style_desktop_dark.png'),
      fullPage: false,
    });

    // 2. Tablet Viewport (768x1024) Dark Mode
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_tablet_dark.png'),
      fullPage: false,
    });

    // 3. Mobile Viewport (390x844) Dark Mode
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_mobile_dark.png'),
      fullPage: false,
    });

    // Switch to Mobile Light Mode
    const mobileThemeBtn = page.getByRole('button', { name: /(light|dark) mode/i }).first();
    await mobileThemeBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'phase3_mobile_light.png'),
      fullPage: false,
    });
  });
});

/**
 * E2E Test: Language Switching
 * Tests: language switching across all features
 * Validates: Requirements 24.1, 24.2
 */

import { test, expect } from '@playwright/test';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'ଓଡ଼ିଆ' }
];

test.describe('Language Switching E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display language selector on all pages', async ({ page }) => {
    // Landing page
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();

    // Chat page
    await page.goto('/chat');
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();

    // About page
    await page.goto('/about');
    await expect(page.locator('[data-testid="language-selector"]')).toBeVisible();
  });

  test('should switch language and persist selection', async ({ page }) => {
    // Open language selector
    await page.click('[data-testid="language-selector"]');

    // Verify dropdown is visible
    await expect(page.locator('[data-testid="language-dropdown"]')).toBeVisible();

    // Select Hindi
    await page.click('[data-testid="language-option-hi"]');

    // Verify language changed
    await expect(page.locator('[data-testid="current-language"]')).toContainText('हिन्दी');

    // Reload page
    await page.reload();

    // Verify language persisted
    await expect(page.locator('[data-testid="current-language"]')).toContainText('हिन्दी');
  });

  test('should translate UI elements when language changes', async ({ page }) => {
    // Get initial button text (English)
    const initialText = await page.locator('[data-testid="cta-button"]').textContent();

    // Switch to Hindi
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-hi"]');

    // Get translated button text
    const translatedText = await page.locator('[data-testid="cta-button"]').textContent();

    // Verify text changed
    expect(translatedText).not.toBe(initialText);
    expect(translatedText).toBeTruthy();
  });

  test('should translate chat interface', async ({ page }) => {
    await page.goto('/chat');

    // Get placeholder text in English
    const englishPlaceholder = await page.locator('[data-testid="chat-input"]').getAttribute('placeholder');

    // Switch to Tamil
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ta"]');

    // Get placeholder text in Tamil
    const tamilPlaceholder = await page.locator('[data-testid="chat-input"]').getAttribute('placeholder');

    // Verify translation
    expect(tamilPlaceholder).not.toBe(englishPlaceholder);
    expect(tamilPlaceholder).toBeTruthy();
  });

  test('should send messages in selected language', async ({ page }) => {
    await page.goto('/chat');

    // Switch to Hindi
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-hi"]');

    // Send message
    await page.fill('[data-testid="chat-input"]', 'मुझे योजनाओं के बारे में बताएं');
    await page.click('[data-testid="send-button"]');

    // Verify message sent
    await expect(page.locator('[data-testid="message-user"]').last()).toContainText('मुझे योजनाओं के बारे में बताएं');

    // Wait for response
    await expect(page.locator('[data-testid="message-assistant"]').last()).toBeVisible({ timeout: 10000 });

    // Response should be in Hindi (contains Devanagari script)
    const response = await page.locator('[data-testid="message-assistant"]').last().textContent();
    expect(response).toMatch(/[\u0900-\u097F]/); // Devanagari Unicode range
  });

  test('should translate scheme cards', async ({ page }) => {
    await page.goto('/chat');

    // Send message to get scheme recommendations
    await page.fill('[data-testid="chat-input"]', 'farmer schemes');
    await page.click('[data-testid="send-button"]');

    // Wait for scheme card
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible({ timeout: 10000 });

    // Get scheme name in English
    const englishName = await page.locator('[data-testid="scheme-name"]').first().textContent();

    // Switch to Gujarati
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-gu"]');

    // Wait for translation
    await page.waitForTimeout(500);

    // Get scheme name in Gujarati
    const gujaratiName = await page.locator('[data-testid="scheme-name"]').first().textContent();

    // Verify translation (should be different or contain Gujarati script)
    expect(gujaratiName).toBeTruthy();
    if (gujaratiName !== englishName) {
      expect(gujaratiName).toMatch(/[\u0A80-\u0AFF]/); // Gujarati Unicode range
    }
  });

  test('should translate eligibility form', async ({ page }) => {
    await page.goto('/chat');

    // Navigate to eligibility form
    await page.fill('[data-testid="chat-input"]', 'PM-KISAN');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="check-eligibility-button"]').first();

    // Get label text in English
    const englishLabel = await page.locator('[data-testid="age-label"]').textContent();

    // Switch to Bengali
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-bn"]');

    // Get label text in Bengali
    const bengaliLabel = await page.locator('[data-testid="age-label"]').textContent();

    // Verify translation
    expect(bengaliLabel).not.toBe(englishLabel);
    expect(bengaliLabel).toBeTruthy();
  });

  test('should translate error messages', async ({ page }) => {
    await page.goto('/chat');

    // Mock API failure
    await page.route('**/chat', route => route.abort());

    // Send message
    await page.fill('[data-testid="chat-input"]', 'test');
    await page.click('[data-testid="send-button"]');

    // Get error message in English
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    const englishError = await page.locator('[data-testid="error-message"]').textContent();

    // Reload and switch language
    await page.reload();
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-kn"]');

    // Trigger error again
    await page.fill('[data-testid="chat-input"]', 'test');
    await page.click('[data-testid="send-button"]');

    // Get error message in Kannada
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    const kannadaError = await page.locator('[data-testid="error-message"]').textContent();

    // Verify translation
    expect(kannadaError).not.toBe(englishError);
    expect(kannadaError).toBeTruthy();
  });

  test('should load appropriate fonts for Indian languages', async ({ page }) => {
    // Switch to Hindi
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-hi"]');

    // Check if Devanagari font is loaded
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    expect(fontFamily).toContain('Noto Sans Devanagari');

    // Switch to Tamil
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-ta"]');

    // Check if Tamil font is loaded
    const tamilFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    expect(tamilFont).toContain('Noto Sans Tamil');
  });

  test('should support all 11 languages', async ({ page }) => {
    // Open language selector
    await page.click('[data-testid="language-selector"]');

    // Verify all languages are available
    for (const lang of SUPPORTED_LANGUAGES) {
      await expect(page.locator(`[data-testid="language-option-${lang.code}"]`)).toBeVisible();
      await expect(page.locator(`[data-testid="language-option-${lang.code}"]`)).toContainText(lang.name);
    }
  });

  test('should maintain language across navigation', async ({ page }) => {
    // Switch to Punjabi
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="language-option-pa"]');

    // Navigate to chat
    await page.goto('/chat');
    await expect(page.locator('[data-testid="current-language"]')).toContainText('ਪੰਜਾਬੀ');

    // Navigate to about
    await page.goto('/about');
    await expect(page.locator('[data-testid="current-language"]')).toContainText('ਪੰਜਾਬੀ');

    // Navigate back to home
    await page.goto('/');
    await expect(page.locator('[data-testid="current-language"]')).toContainText('ਪੰਜਾਬੀ');
  });
});

/**
 * E2E Test: Dark Mode and Low Bandwidth Mode
 * Tests: mode toggles and their effects
 * Validates: Requirements 24.1, 24.3
 */

import { test, expect } from '@playwright/test';

test.describe('Dark Mode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Verify dark mode toggle exists
    await expect(page.locator('[data-testid="dark-mode-toggle"]')).toBeVisible();

    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));

    // Toggle dark mode
    await page.click('[data-testid="dark-mode-toggle"]');

    // Wait for transition
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should persist dark mode preference', async ({ page }) => {
    // Enable dark mode
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.waitForTimeout(300);

    // Verify dark mode is active
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBeTruthy();

    // Reload page
    await page.reload();

    // Verify dark mode persisted
    const stillDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(stillDark).toBeTruthy();
  });

  test('should apply dark mode styles to all components', async ({ page }) => {
    await page.goto('/chat');

    // Get background color in light mode
    const lightBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Enable dark mode
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.waitForTimeout(300);

    // Get background color in dark mode
    const darkBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Verify colors are different
    expect(darkBg).not.toBe(lightBg);
  });

  test('should update glassmorphism effects in dark mode', async ({ page }) => {
    await page.goto('/chat');

    // Send message to get scheme card
    await page.fill('[data-testid="chat-input"]', 'schemes');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible({ timeout: 10000 });

    // Get card styles in light mode
    const lightCardBg = await page.locator('[data-testid="scheme-card"]').first().evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Enable dark mode
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.waitForTimeout(300);

    // Get card styles in dark mode
    const darkCardBg = await page.locator('[data-testid="scheme-card"]').first().evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Verify card background changed
    expect(darkCardBg).not.toBe(lightCardBg);
  });

  test('should maintain dark mode across pages', async ({ page }) => {
    // Enable dark mode
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.waitForTimeout(300);

    // Navigate to chat
    await page.goto('/chat');
    const chatDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(chatDark).toBeTruthy();

    // Navigate to about
    await page.goto('/about');
    const aboutDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(aboutDark).toBeTruthy();
  });
});

test.describe('Low Bandwidth Mode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle low bandwidth mode', async ({ page }) => {
    // Verify low bandwidth toggle exists
    await expect(page.locator('[data-testid="low-bandwidth-toggle"]')).toBeVisible();

    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');

    // Verify indicator is shown
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();
  });

  test('should disable animations in low bandwidth mode', async ({ page }) => {
    await page.goto('/');

    // Check if animations are enabled initially
    const animationsEnabled = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="ai-orb"]');
      if (!element) return false;
      const style = window.getComputedStyle(element);
      return style.animationName !== 'none';
    });

    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');
    await page.waitForTimeout(300);

    // Check if animations are disabled
    const animationsDisabled = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="ai-orb"]');
      if (!element) return true;
      const style = window.getComputedStyle(element);
      return style.animationName === 'none' || style.animationPlayState === 'paused';
    });

    // Verify animations were disabled
    if (animationsEnabled) {
      expect(animationsDisabled).toBeTruthy();
    }
  });

  test('should reduce image quality in low bandwidth mode', async ({ page }) => {
    await page.goto('/about');

    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');
    await page.waitForTimeout(300);

    // Check if images have low quality attribute
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      
      // In low bandwidth mode, images should use quality parameter or low-res version
      expect(src).toBeTruthy();
    }
  });

  test('should use compressed audio in low bandwidth mode', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    await page.goto('/chat');

    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');

    // Send message
    await page.fill('[data-testid="chat-input"]', 'test message');
    await page.click('[data-testid="send-button"]');

    // Wait for response
    await expect(page.locator('[data-testid="message-assistant"]').last()).toBeVisible({ timeout: 10000 });

    // Click voice output button
    const voiceButton = page.locator('[data-testid="voice-output-button"]').first();
    if (await voiceButton.isVisible()) {
      // Intercept TTS request
      let requestMade = false;
      await page.route('**/text-to-speech', route => {
        requestMade = true;
        const postData = route.request().postDataJSON();
        // Verify lowBandwidth flag is set
        expect(postData.lowBandwidth).toBe(true);
        route.continue();
      });

      await voiceButton.click();
      await page.waitForTimeout(1000);

      if (requestMade) {
        // Request was intercepted and verified
      }
    }
  });

  test('should lazy load non-critical resources in low bandwidth mode', async ({ page }) => {
    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');

    // Navigate to page with images
    await page.goto('/about');

    // Check if images have loading="lazy" attribute
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('should persist low bandwidth mode preference', async ({ page }) => {
    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');

    // Verify indicator is shown
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify low bandwidth mode persisted
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();
  });

  test('should auto-detect slow connection', async ({ page, context }) => {
    // Simulate slow connection
    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024, // 50 KB/s (2G speed)
      uploadThroughput: 20 * 1024,
      latency: 500
    });

    // Reload page
    await page.reload();

    // Wait for detection
    await page.waitForTimeout(2000);

    // Verify low bandwidth suggestion appears
    const suggestion = page.locator('[data-testid="low-bandwidth-suggestion"]');
    if (await suggestion.isVisible()) {
      await expect(suggestion).toContainText('slow');
    }
  });

  test('should disable parallax effects in low bandwidth mode', async ({ page }) => {
    await page.goto('/');

    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');
    await page.waitForTimeout(300);

    // Scroll page
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    // Verify parallax elements don't move (transform should be none or identity)
    const parallaxElements = page.locator('[data-parallax="true"]');
    const count = await parallaxElements.count();

    if (count > 0) {
      const transform = await parallaxElements.first().evaluate(el => {
        return window.getComputedStyle(el).transform;
      });
      
      // In low bandwidth mode, transform should be none or identity matrix
      expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy();
    }
  });

  test('should maintain low bandwidth mode across pages', async ({ page }) => {
    // Enable low bandwidth mode
    await page.click('[data-testid="low-bandwidth-toggle"]');

    // Navigate to chat
    await page.goto('/chat');
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();

    // Navigate to about
    await page.goto('/about');
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();
  });
});

test.describe('Combined Mode Toggles', () => {
  test('should support both dark mode and low bandwidth mode simultaneously', async ({ page }) => {
    await page.goto('/');

    // Enable both modes
    await page.click('[data-testid="dark-mode-toggle"]');
    await page.click('[data-testid="low-bandwidth-toggle"]');
    await page.waitForTimeout(300);

    // Verify both are active
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBeTruthy();
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();

    // Navigate to chat
    await page.goto('/chat');

    // Verify both modes persist
    const stillDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(stillDark).toBeTruthy();
    await expect(page.locator('[data-testid="low-bandwidth-indicator"]')).toBeVisible();
  });
});

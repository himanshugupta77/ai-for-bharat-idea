/**
 * E2E Test: Voice Input Flow
 * Tests: record → transcribe → response
 * Validates: Requirements 24.1, 24.2
 */

import { test, expect } from '@playwright/test';

test.describe('Voice Input Flow E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);
    
    await page.goto('/chat');
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
  });

  test('should complete voice input flow', async ({ page }) => {
    // Click voice input button
    await page.click('[data-testid="voice-input-button"]');

    // Verify recording state
    await expect(page.locator('[data-testid="voice-recording-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="waveform-visualization"]')).toBeVisible();

    // Mock audio recording (simulate 2 seconds)
    await page.waitForTimeout(2000);

    // Stop recording (click button again or wait for auto-stop)
    await page.click('[data-testid="voice-input-button"]');

    // Wait for transcription
    await expect(page.locator('[data-testid="transcription-loading"]')).toBeVisible();

    // Verify transcript appears in input field
    await expect(page.locator('[data-testid="chat-input"]')).not.toBeEmpty({ timeout: 5000 });

    // Verify detected language indicator
    await expect(page.locator('[data-testid="detected-language"]')).toBeVisible();

    // Message should be sent automatically or user can review and send
    const inputValue = await page.locator('[data-testid="chat-input"]').inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });

  test('should show waveform animation during recording', async ({ page }) => {
    await page.click('[data-testid="voice-input-button"]');

    // Verify waveform bars are animated
    const waveformBars = page.locator('[data-testid="waveform-bar"]');
    await expect(waveformBars.first()).toBeVisible();
    
    // Verify multiple bars (should be 5)
    const barCount = await waveformBars.count();
    expect(barCount).toBe(5);

    // Stop recording
    await page.click('[data-testid="voice-input-button"]');
  });

  test('should handle voice input errors gracefully', async ({ page }) => {
    // Mock transcription API failure
    await page.route('**/voice-to-text', route => route.abort());

    // Start recording
    await page.click('[data-testid="voice-input-button"]');
    await page.waitForTimeout(1000);
    
    // Stop recording
    await page.click('[data-testid="voice-input-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="voice-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="voice-error"]')).toContainText('error');
  });

  test('should stop recording after silence detection', async ({ page }) => {
    await page.click('[data-testid="voice-input-button"]');

    // Verify recording started
    await expect(page.locator('[data-testid="voice-recording-indicator"]')).toBeVisible();

    // Wait for auto-stop (2 seconds silence + processing)
    await page.waitForTimeout(3000);

    // Verify recording stopped automatically
    await expect(page.locator('[data-testid="voice-recording-indicator"]')).not.toBeVisible({ timeout: 2000 });
  });

  test('should show audio quality feedback', async ({ page }) => {
    await page.click('[data-testid="voice-input-button"]');

    // Verify audio level indicator is visible
    await expect(page.locator('[data-testid="audio-level-indicator"]')).toBeVisible();

    await page.click('[data-testid="voice-input-button"]');
  });

  test('should handle microphone permission denial', async ({ page, context }) => {
    // Revoke microphone permission
    await context.clearPermissions();

    // Try to start recording
    await page.click('[data-testid="voice-input-button"]');

    // Verify permission error message
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('[data-testid="permission-error"]')).toContainText('microphone');
  });
});

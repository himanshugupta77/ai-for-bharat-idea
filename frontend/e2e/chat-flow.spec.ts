/**
 * E2E Test: Complete Chat Flow
 * Tests: text input → response → scheme recommendation
 * Validates: Requirements 24.1, 24.2
 */

import { test, expect } from '@playwright/test';

test.describe('Chat Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to chat page
    await page.click('text=Start Chatting');
    await expect(page).toHaveURL('/chat');
  });

  test('should complete full chat flow with scheme recommendation', async ({ page }) => {
    // Wait for chat interface to load
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();

    // Type a message
    const message = 'I am a farmer looking for government schemes';
    await page.fill('[data-testid="chat-input"]', message);

    // Send message
    await page.click('[data-testid="send-button"]');

    // Verify user message appears
    await expect(page.locator('[data-testid="message-user"]').last()).toContainText(message);

    // Wait for typing indicator
    await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();

    // Wait for assistant response (max 10 seconds)
    await expect(page.locator('[data-testid="message-assistant"]').last()).toBeVisible({ timeout: 10000 });

    // Verify response contains text
    const response = await page.locator('[data-testid="message-assistant"]').last().textContent();
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(10);

    // Verify scheme card appears
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible();

    // Verify scheme card has required elements
    await expect(page.locator('[data-testid="scheme-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="scheme-description"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="check-eligibility-button"]').first()).toBeVisible();
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    // Send first message
    await page.fill('[data-testid="chat-input"]', 'Tell me about PM-KISAN');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="message-assistant"]').first()).toBeVisible({ timeout: 10000 });

    // Send follow-up message
    await page.fill('[data-testid="chat-input"]', 'What are the eligibility criteria?');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="message-assistant"]').nth(1)).toBeVisible({ timeout: 10000 });

    // Verify both messages are visible
    const messages = await page.locator('[data-testid^="message-"]').count();
    expect(messages).toBeGreaterThanOrEqual(4); // 2 user + 2 assistant
  });

  test('should display error message on API failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/chat', route => route.abort());

    // Send message
    await page.fill('[data-testid="chat-input"]', 'Test message');
    await page.click('[data-testid="send-button"]');

    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
  });

  test('should enforce character limit', async ({ page }) => {
    // Type message exceeding 1000 characters
    const longMessage = 'a'.repeat(1001);
    await page.fill('[data-testid="chat-input"]', longMessage);

    // Verify character counter shows limit exceeded
    await expect(page.locator('[data-testid="character-counter"]')).toContainText('1001/1000');

    // Verify send button is disabled
    await expect(page.locator('[data-testid="send-button"]')).toBeDisabled();
  });

  test('should auto-scroll to latest message', async ({ page }) => {
    // Send multiple messages to create scroll
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="chat-input"]', `Message ${i + 1}`);
      await page.click('[data-testid="send-button"]');
      await page.waitForTimeout(500);
    }

    // Verify last message is in viewport
    const lastMessage = page.locator('[data-testid="message-user"]').last();
    await expect(lastMessage).toBeInViewport();
  });
});

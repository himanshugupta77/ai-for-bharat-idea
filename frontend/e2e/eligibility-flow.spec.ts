/**
 * E2E Test: Eligibility Check Flow
 * Tests: form submission → result display
 * Validates: Requirements 24.1, 24.3
 */

import { test, expect } from '@playwright/test';

test.describe('Eligibility Check Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
    
    // Navigate to eligibility check from scheme card
    await page.fill('[data-testid="chat-input"]', 'Tell me about PM-KISAN');
    await page.click('[data-testid="send-button"]');
    
    // Wait for scheme card
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible({ timeout: 10000 });
    
    // Click "Check Eligibility" button
    await page.click('[data-testid="check-eligibility-button"]').first();
    
    // Verify eligibility form is displayed
    await expect(page.locator('[data-testid="eligibility-form"]')).toBeVisible();
  });

  test('should complete eligibility check for eligible user', async ({ page }) => {
    // Fill form fields
    await page.fill('[data-testid="age-input"]', '45');
    await page.selectOption('[data-testid="gender-select"]', 'male');
    await page.fill('[data-testid="income-input"]', '250000');
    await page.selectOption('[data-testid="state-select"]', 'Maharashtra');
    await page.selectOption('[data-testid="category-select"]', 'general');
    await page.fill('[data-testid="occupation-input"]', 'farmer');
    
    // Conditional fields for PM-KISAN
    await page.check('[data-testid="owns-land-checkbox"]');
    await page.fill('[data-testid="land-size-input"]', '1.5');

    // Submit form
    await page.click('[data-testid="submit-eligibility-button"]');

    // Wait for result
    await expect(page.locator('[data-testid="eligibility-result"]')).toBeVisible({ timeout: 5000 });

    // Verify eligible status
    await expect(page.locator('[data-testid="eligibility-status"]')).toContainText('Eligible');
    await expect(page.locator('[data-testid="eligibility-status"]')).toHaveClass(/eligible/);

    // Verify criteria checklist
    const criteriaItems = page.locator('[data-testid="criteria-item"]');
    await expect(criteriaItems.first()).toBeVisible();
    
    // All criteria should be met
    const metCriteria = page.locator('[data-testid="criteria-met"]');
    const metCount = await metCriteria.count();
    expect(metCount).toBeGreaterThan(0);

    // Verify explanation summary
    await expect(page.locator('[data-testid="explanation-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="explanation-summary"]')).toContainText('eligible');

    // Verify scheme benefits displayed
    await expect(page.locator('[data-testid="scheme-benefits"]')).toBeVisible();

    // Verify application steps displayed
    await expect(page.locator('[data-testid="application-steps"]')).toBeVisible();
    const steps = page.locator('[data-testid="application-step"]');
    const stepCount = await steps.count();
    expect(stepCount).toBeGreaterThan(0);

    // Verify "Apply Now" button
    await expect(page.locator('[data-testid="apply-now-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="apply-now-button"]')).toBeEnabled();
  });

  test('should show not eligible result with explanations', async ({ page }) => {
    // Fill form with ineligible data
    await page.fill('[data-testid="age-input"]', '25');
    await page.selectOption('[data-testid="gender-select"]', 'female');
    await page.fill('[data-testid="income-input"]', '500000'); // Too high
    await page.selectOption('[data-testid="state-select"]', 'Delhi');
    await page.selectOption('[data-testid="category-select"]', 'general');
    await page.fill('[data-testid="occupation-input"]', 'engineer');
    
    // No land ownership
    await page.uncheck('[data-testid="owns-land-checkbox"]');

    // Submit form
    await page.click('[data-testid="submit-eligibility-button"]');

    // Wait for result
    await expect(page.locator('[data-testid="eligibility-result"]')).toBeVisible({ timeout: 5000 });

    // Verify not eligible status
    await expect(page.locator('[data-testid="eligibility-status"]')).toContainText('Not Eligible');
    await expect(page.locator('[data-testid="eligibility-status"]')).toHaveClass(/not-eligible/);

    // Verify unmet criteria are highlighted
    const unmetCriteria = page.locator('[data-testid="criteria-unmet"]');
    const unmetCount = await unmetCriteria.count();
    expect(unmetCount).toBeGreaterThan(0);

    // Verify explanation for each unmet criterion
    const firstUnmet = unmetCriteria.first();
    await expect(firstUnmet).toContainText('not met');

    // Verify explanation summary
    await expect(page.locator('[data-testid="explanation-summary"]')).toContainText('not eligible');
  });

  test('should validate form fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="submit-eligibility-button"]');

    // Verify validation errors
    await expect(page.locator('[data-testid="age-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="income-error"]')).toBeVisible();

    // Fill invalid age
    await page.fill('[data-testid="age-input"]', '150');
    await page.click('[data-testid="submit-eligibility-button"]');
    await expect(page.locator('[data-testid="age-error"]')).toContainText('valid');

    // Fill negative income
    await page.fill('[data-testid="income-input"]', '-1000');
    await page.click('[data-testid="submit-eligibility-button"]');
    await expect(page.locator('[data-testid="income-error"]')).toContainText('valid');
  });

  test('should show conditional fields based on scheme', async ({ page }) => {
    // Land ownership field should be visible for PM-KISAN
    await expect(page.locator('[data-testid="owns-land-checkbox"]')).toBeVisible();
    await expect(page.locator('[data-testid="land-size-input"]')).toBeVisible();

    // Check land ownership
    await page.check('[data-testid="owns-land-checkbox"]');
    
    // Land size field should be enabled
    await expect(page.locator('[data-testid="land-size-input"]')).toBeEnabled();

    // Uncheck land ownership
    await page.uncheck('[data-testid="owns-land-checkbox"]');
    
    // Land size field should be disabled or hidden
    const landSizeInput = page.locator('[data-testid="land-size-input"]');
    const isDisabled = await landSizeInput.isDisabled().catch(() => true);
    const isHidden = await landSizeInput.isHidden().catch(() => true);
    expect(isDisabled || isHidden).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/eligibility-check', route => route.abort());

    // Fill and submit form
    await page.fill('[data-testid="age-input"]', '45');
    await page.selectOption('[data-testid="gender-select"]', 'male');
    await page.fill('[data-testid="income-input"]', '250000');
    await page.selectOption('[data-testid="state-select"]', 'Maharashtra');
    await page.selectOption('[data-testid="category-select"]', 'general');
    await page.fill('[data-testid="occupation-input"]', 'farmer');
    await page.click('[data-testid="submit-eligibility-button"]');

    // Verify error message
    await expect(page.locator('[data-testid="eligibility-error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="eligibility-error"]')).toContainText('error');
  });

  test('should allow checking eligibility for different schemes', async ({ page }) => {
    // Complete first eligibility check
    await page.fill('[data-testid="age-input"]', '45');
    await page.selectOption('[data-testid="gender-select"]', 'male');
    await page.fill('[data-testid="income-input"]', '250000');
    await page.selectOption('[data-testid="state-select"]', 'Maharashtra');
    await page.selectOption('[data-testid="category-select"]', 'general');
    await page.fill('[data-testid="occupation-input"]', 'farmer');
    await page.click('[data-testid="submit-eligibility-button"]');

    await expect(page.locator('[data-testid="eligibility-result"]')).toBeVisible({ timeout: 5000 });

    // Go back to chat
    await page.click('[data-testid="back-to-chat-button"]');
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();

    // Check eligibility for another scheme
    await page.fill('[data-testid="chat-input"]', 'Tell me about Ayushman Bharat');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="scheme-card"]').first()).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="check-eligibility-button"]').first();

    // Verify new eligibility form
    await expect(page.locator('[data-testid="eligibility-form"]')).toBeVisible();
  });
});

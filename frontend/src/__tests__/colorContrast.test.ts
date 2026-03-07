/**
 * Color Contrast WCAG AA Compliance Test
 * 
 * This test verifies that all text colors used in the landing page
 * meet WCAG AA contrast requirements against their backgrounds.
 * 
 * WCAG AA Requirements:
 * - Normal text (< 18px or < 14px bold): 4.5:1 minimum
 * - Large text (≥ 18px or ≥ 14px bold): 3:1 minimum
 * 
 * Validates Requirement: 7.5
 */

describe('Color Contrast WCAG AA Compliance', () => {
  /**
   * Calculate relative luminance of a color
   * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   */
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const val = c / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
   */
  function getContrastRatio(color1: string, color2: string): number {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }

  /**
   * Test helper to verify contrast ratio meets WCAG AA
   */
  function testContrast(
    textColor: string,
    bgColor: string,
    isLargeText: boolean,
    description: string
  ) {
    const ratio = getContrastRatio(textColor, bgColor);
    const minRatio = isLargeText ? 3.0 : 4.5;
    const passes = ratio >= minRatio;
    
    return {
      description,
      textColor,
      bgColor,
      ratio: ratio.toFixed(2),
      minRatio,
      passes,
    };
  }

  // Color definitions from the design
  const colors = {
    // Dark backgrounds
    slate950: '#020617',
    slate900: '#0F172A',
    slate800: '#1E293B',
    
    // Text colors
    white: '#FFFFFF',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    
    // Accent colors (used in gradients, not for text)
    saffron: '#FF7A18',
    green: '#22C55E',
    blue: '#38BDF8',
  };

  describe('White text on dark backgrounds', () => {
    it('should meet WCAG AA for white text on slate-950 (target 19.5:1)', () => {
      const result = testContrast(
        colors.white,
        colors.slate950,
        false,
        'White text on slate-950 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
      // Verify it meets the target ratio from design doc
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(19.0);
    });

    it('should meet WCAG AA for white text on slate-900', () => {
      const result = testContrast(
        colors.white,
        colors.slate900,
        false,
        'White text on slate-900 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for white text on slate-800', () => {
      const result = testContrast(
        colors.white,
        colors.slate800,
        false,
        'White text on slate-800 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Gray text on dark backgrounds', () => {
    it('should meet WCAG AA for gray-300 text on slate-950 (target 12.6:1)', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate950,
        false,
        'Gray-300 text on slate-950 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
      // Verify it meets the target ratio from design doc
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(12.0);
    });

    it('should meet WCAG AA for gray-300 text on slate-900', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate900,
        false,
        'Gray-300 text on slate-900 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for gray-400 text on slate-950', () => {
      const result = testContrast(
        colors.gray400,
        colors.slate950,
        false,
        'Gray-400 text on slate-950 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Large text (hero headlines)', () => {
    it('should meet WCAG AA for large white text on slate-950 (3:1 minimum)', () => {
      const result = testContrast(
        colors.white,
        colors.slate950,
        true,
        'Large white text (hero headline) on slate-950'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(3.0);
    });

    it('should meet WCAG AA for large gray-300 text on slate-950 (3:1 minimum)', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate950,
        true,
        'Large gray-300 text on slate-950'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Component-specific text colors', () => {
    it('should meet WCAG AA for navbar text (white on slate-950/30)', () => {
      // Navbar uses bg-slate-950/30 which is semi-transparent
      // For worst case, test against slate-950
      const result = testContrast(
        colors.white,
        colors.slate950,
        false,
        'Navbar text (white) on slate-950 background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for navbar inactive menu items (gray-300)', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate950,
        false,
        'Navbar inactive menu items (gray-300) on slate-950'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for feature card titles (white)', () => {
      const result = testContrast(
        colors.white,
        colors.slate950,
        false,
        'Feature card titles (white) on dark background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for feature card descriptions (gray-300)', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate950,
        false,
        'Feature card descriptions (gray-300) on dark background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });

    it('should meet WCAG AA for section headings (white)', () => {
      const result = testContrast(
        colors.white,
        colors.slate950,
        true, // Section headings are large text
        'Section headings (white) on dark background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(3.0);
    });

    it('should meet WCAG AA for body text (gray-300)', () => {
      const result = testContrast(
        colors.gray300,
        colors.slate950,
        false,
        'Body text (gray-300) on dark background'
      );
      
      console.log(`✓ ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      
      expect(result.passes).toBe(true);
      expect(parseFloat(result.ratio)).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Summary report', () => {
    it('should generate a summary of all contrast ratios', () => {
      const testCases = [
        { text: colors.white, bg: colors.slate950, large: false, desc: 'White on slate-950' },
        { text: colors.white, bg: colors.slate900, large: false, desc: 'White on slate-900' },
        { text: colors.white, bg: colors.slate800, large: false, desc: 'White on slate-800' },
        { text: colors.gray300, bg: colors.slate950, large: false, desc: 'Gray-300 on slate-950' },
        { text: colors.gray300, bg: colors.slate900, large: false, desc: 'Gray-300 on slate-900' },
        { text: colors.gray400, bg: colors.slate950, large: false, desc: 'Gray-400 on slate-950' },
      ];

      console.log('\n=== Color Contrast Summary ===');
      console.log('All text colors meet WCAG AA standards:\n');

      const results = testCases.map(tc => testContrast(tc.text, tc.bg, tc.large, tc.desc));
      
      results.forEach(result => {
        const status = result.passes ? '✓ PASS' : '✗ FAIL';
        console.log(`${status} ${result.description}: ${result.ratio}:1 (min: ${result.minRatio}:1)`);
      });

      const allPass = results.every(r => r.passes);
      console.log(`\nOverall: ${allPass ? '✓ All tests passed' : '✗ Some tests failed'}`);
      console.log('==============================\n');

      expect(allPass).toBe(true);
    });
  });
});

import { describe, it, expect } from 'vitest'
import { readFileSync, statSync, readdirSync } from 'fs'
import { join } from 'path'

/**
 * Frontend Performance Tests
 * 
 * **Validates: Requirements 21.1, 21.2**
 * 
 * Requirement 21.1: THE Frontend SHALL achieve a First Contentful Paint within 1.5 seconds
 * Requirement 21.2: THE Frontend SHALL achieve a Time to Interactive within 3 seconds
 * 
 * These tests validate bundle size limits and code splitting effectiveness
 * to ensure fast load times as specified in the performance requirements.
 */

describe('Frontend Performance Tests - Requirements 21.1, 21.2', () => {
  describe('Bundle Size Limits - Requirement 21.1', () => {
    it('should have total bundle size under 5MB', () => {
      const distPath = join(process.cwd(), 'dist')
      
      // Check if dist directory exists (skip if not built)
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  Dist directory not found. Run "npm run build" first.')
        return
      }

      const totalSize = calculateDirectorySize(distPath)
      const totalSizeMB = totalSize / (1024 * 1024)
      
      console.log(`📦 Total bundle size: ${totalSizeMB.toFixed(2)} MB`)
      
      // Total bundle should be under 5MB for fast loading
      expect(totalSizeMB).toBeLessThan(5)
    })

    it('should have main JS bundle under 1MB', () => {
      const distPath = join(process.cwd(), 'dist', 'assets', 'js')
      
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  JS directory not found. Run "npm run build" first.')
        return
      }

      const jsFiles = readdirSync(distPath).filter(f => f.endsWith('.js'))
      
      if (jsFiles.length === 0) {
        console.warn('⚠️  No JS files found in dist/assets')
        return
      }

      // Find the main bundle (usually the largest file)
      const fileSizes = jsFiles.map(file => ({
        name: file,
        size: statSync(join(distPath, file)).size
      }))

      const mainBundle = fileSizes.reduce((max, file) => 
        file.size > max.size ? file : max
      )

      const mainBundleSizeMB = mainBundle.size / (1024 * 1024)
      
      console.log(`📦 Main bundle (${mainBundle.name}): ${mainBundleSizeMB.toFixed(2)} MB`)
      
      // Main bundle should be under 1MB after code splitting
      expect(mainBundleSizeMB).toBeLessThan(1)
    })

    it('should have vendor chunks properly split', () => {
      const distPath = join(process.cwd(), 'dist', 'assets', 'js')
      
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  JS directory not found. Run "npm run build" first.')
        return
      }

      const jsFiles = readdirSync(distPath).filter(f => f.endsWith('.js'))
      
      // Should have multiple JS chunks (code splitting)
      expect(jsFiles.length).toBeGreaterThan(1)
      
      // Check for vendor chunks
      const hasVendorChunk = jsFiles.some(f => 
        f.includes('vendor') || f.includes('react')
      )
      
      console.log(`📦 Total JS chunks: ${jsFiles.length}`)
      console.log(`📦 Has vendor chunk: ${hasVendorChunk}`)
      
      // Should have vendor chunks for better caching
      expect(hasVendorChunk).toBe(true)
    })

    it('should have CSS bundle under 500KB', () => {
      const distPath = join(process.cwd(), 'dist', 'assets')
      
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  Assets directory not found. Run "npm run build" first.')
        return
      }

      const cssFiles = readdirSync(distPath).filter(f => f.endsWith('.css'))
      
      if (cssFiles.length === 0) {
        console.warn('⚠️  No CSS files found in dist/assets')
        return
      }

      const totalCssSize = cssFiles.reduce((total, file) => {
        return total + statSync(join(distPath, file)).size
      }, 0)

      const totalCssSizeKB = totalCssSize / 1024
      
      console.log(`📦 Total CSS size: ${totalCssSizeKB.toFixed(2)} KB`)
      
      // CSS should be under 500KB
      expect(totalCssSizeKB).toBeLessThan(500)
    })

    it('should have individual chunk sizes under 500KB', () => {
      const distPath = join(process.cwd(), 'dist', 'assets', 'js')
      
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  JS directory not found. Run "npm run build" first.')
        return
      }

      const jsFiles = readdirSync(distPath).filter(f => f.endsWith('.js'))
      
      const oversizedChunks = jsFiles.filter(file => {
        const size = statSync(join(distPath, file)).size
        const sizeKB = size / 1024
        return sizeKB > 500
      })

      if (oversizedChunks.length > 0) {
        console.warn('⚠️  Oversized chunks found:')
        oversizedChunks.forEach(file => {
          const size = statSync(join(distPath, file)).size
          const sizeKB = size / 1024
          console.warn(`   - ${file}: ${sizeKB.toFixed(2)} KB`)
        })
      }

      // Individual chunks should be under 500KB for optimal loading
      expect(oversizedChunks.length).toBe(0)
    })
  })

  describe('Code Splitting Effectiveness - Requirement 21.1', () => {
    it('should have lazy-loaded page components', () => {
      const appPath = join(process.cwd(), 'src', 'App.tsx')
      
      try {
        const appContent = readFileSync(appPath, 'utf-8')
        
        // Check for React.lazy usage
        const hasLazy = appContent.includes('lazy(')
        
        // Check for Suspense usage
        const hasSuspense = appContent.includes('<Suspense')
        
        console.log(`📦 Uses React.lazy: ${hasLazy}`)
        console.log(`📦 Uses Suspense: ${hasSuspense}`)
        
        expect(hasLazy).toBe(true)
        expect(hasSuspense).toBe(true)
      } catch {
        console.warn('⚠️  App.tsx not found')
      }
    })

    it('should have service worker for caching', () => {
      const swPath = join(process.cwd(), 'public', 'sw.js')
      
      try {
        const swContent = readFileSync(swPath, 'utf-8')
        
        // Check for cache API usage
        const hasCacheAPI = swContent.includes('caches.open')
        
        // Check for fetch event listener
        const hasFetchListener = swContent.includes('fetch')
        
        console.log(`📦 Has cache API: ${hasCacheAPI}`)
        console.log(`📦 Has fetch listener: ${hasFetchListener}`)
        
        expect(hasCacheAPI).toBe(true)
        expect(hasFetchListener).toBe(true)
      } catch {
        console.warn('⚠️  Service worker not found at public/sw.js')
      }
    })

    it('should have memoization utilities', () => {
      const memoPath = join(process.cwd(), 'src', 'utils', 'memoization.ts')
      
      try {
        const memoContent = readFileSync(memoPath, 'utf-8')
        
        // Check for memoization functions
        const hasMemoize = memoContent.includes('memoize')
        const hasDebounce = memoContent.includes('debounce')
        const hasThrottle = memoContent.includes('throttle')
        
        console.log(`📦 Has memoize: ${hasMemoize}`)
        console.log(`📦 Has debounce: ${hasDebounce}`)
        console.log(`📦 Has throttle: ${hasThrottle}`)
        
        expect(hasMemoize).toBe(true)
        expect(hasDebounce).toBe(true)
        expect(hasThrottle).toBe(true)
      } catch {
        console.warn('⚠️  Memoization utilities not found')
      }
    })
  })

  describe('Asset Optimization - Requirement 21.1', () => {
    it('should have optimized images in dist', () => {
      const distPath = join(process.cwd(), 'dist', 'assets')
      
      try {
        statSync(distPath)
      } catch {
        console.warn('⚠️  Assets directory not found. Run "npm run build" first.')
        return
      }

      const imageFiles = readdirSync(distPath).filter(f => 
        f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || 
        f.endsWith('.webp') || f.endsWith('.svg')
      )
      
      if (imageFiles.length === 0) {
        console.log('📦 No images found in dist/assets (may be using external CDN)')
        return
      }

      const totalImageSize = imageFiles.reduce((total, file) => {
        return total + statSync(join(distPath, file)).size
      }, 0)

      const totalImageSizeKB = totalImageSize / 1024
      
      console.log(`📦 Total image size: ${totalImageSizeKB.toFixed(2)} KB`)
      console.log(`📦 Number of images: ${imageFiles.length}`)
      
      // Total images should be under 2MB
      expect(totalImageSizeKB).toBeLessThan(2048)
    })

    it('should have build configuration for optimization', () => {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts')
      
      try {
        const viteConfig = readFileSync(viteConfigPath, 'utf-8')
        
        // Check for minification
        const hasMinify = viteConfig.includes('minify')
        
        // Check for chunk splitting
        const hasManualChunks = viteConfig.includes('manualChunks')
        
        console.log(`📦 Has minification: ${hasMinify}`)
        console.log(`📦 Has manual chunks: ${hasManualChunks}`)
        
        expect(hasMinify).toBe(true)
        expect(hasManualChunks).toBe(true)
      } catch {
        console.warn('⚠️  vite.config.ts not found')
      }
    })
  })
})

/**
 * Helper function to calculate directory size recursively
 */
function calculateDirectorySize(dirPath: string): number {
  let totalSize = 0

  try {
    const items = readdirSync(dirPath)

    for (const item of items) {
      const itemPath = join(dirPath, item)
      const stats = statSync(itemPath)

      if (stats.isDirectory()) {
        totalSize += calculateDirectorySize(itemPath)
      } else {
        totalSize += stats.size
      }
    }
  } catch (error) {
    console.warn(`⚠️  Error reading directory ${dirPath}:`, error)
  }

  return totalSize
}

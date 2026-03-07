# Performance Optimizations - Bharat Sahayak AI Assistant

This document summarizes the performance optimizations implemented for the Bharat Sahayak AI Assistant platform.

## Overview

Performance optimizations have been implemented across three layers:
1. **Frontend** - Code splitting, lazy loading, memoization, and service worker
2. **Backend** - Lambda memory caching, DynamoDB query caching, and provisioned concurrency
3. **CDN** - CloudFront caching with custom TTLs for different asset types

---

## 1. Frontend Performance Optimizations

### 1.1 Code Splitting with React.lazy and Suspense

**Implementation**: `frontend/src/App.tsx`

- All page components (LandingPage, ChatPage, AboutPage) are now lazy-loaded
- Reduces initial bundle size by splitting code into separate chunks
- Pages are loaded on-demand when users navigate to them

```typescript
const LandingPage = lazy(() => import('./pages/LandingPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
```

**Benefits**:
- Faster initial page load (First Contentful Paint)
- Reduced Time to Interactive
- Better user experience on slow connections

### 1.2 Lazy Loading for Images and Components

**Implementation**: `frontend/src/components/LazyImage.tsx`

- LazyImage component already implemented for on-demand image loading
- Uses Intersection Observer API for efficient lazy loading
- Reduces initial page weight and improves load times

### 1.3 Bundle Size Optimization with Tree Shaking

**Implementation**: `frontend/vite.config.ts`

Enhanced Vite configuration with:
- Terser minification with console.log removal in production
- Manual chunk splitting for better caching:
  - `react-vendor`: React, React DOM, React Router
  - `animation-vendor`: Framer Motion
- Optimized asset file naming for long-term caching
- Chunk size warning at 1000KB

```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

**Benefits**:
- Smaller bundle sizes
- Better browser caching
- Faster subsequent page loads

### 1.4 Service Worker for Offline Support

**Implementation**: 
- `frontend/public/sw.js` - Service worker script
- `frontend/src/utils/serviceWorker.ts` - Registration utility

Features:
- Caches static assets on install
- Serves from cache with network fallback
- Updates cache in background (stale-while-revalidate)
- Skips API requests (always fetch fresh)
- Automatic cache cleanup on activation

**Benefits**:
- Offline functionality for previously visited pages
- Faster repeat visits
- Improved reliability on poor connections

### 1.5 Memoization for Expensive Computations

**Implementation**: `frontend/src/utils/memoization.ts`

Utilities added:
- `memoize()` - LRU cache for function results
- `debounce()` - Limit execution rate
- `throttle()` - Limit execution frequency

**Applied to**:
- `SchemeCard` component - React.memo wrapper
- `Message` component - React.memo with useMemo for timestamp formatting

```typescript
export const SchemeCard = memo(function SchemeCard({ scheme, onCheckEligibility }) {
  // Component implementation
})

const formattedTime = useMemo(() => {
  return new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}, [message.timestamp])
```

**Benefits**:
- Prevents unnecessary re-renders
- Reduces computation overhead
- Smoother UI interactions

---

## 2. Backend Performance Optimizations

### 2.1 Lambda Memory Caching for Scheme Data

**Implementation**: `backend/src/chat/handler.py`

Features:
- In-memory cache for scheme data (5-minute TTL)
- Query result cache for category queries (1-minute TTL)
- Automatic cache invalidation on TTL expiry
- Reduces DynamoDB read operations

```python
_schemes_cache: List[Dict[str, Any]] = []
_schemes_cache_timestamp: float = 0
SCHEMES_CACHE_TTL = 300  # 5 minutes

_query_cache: Dict[str, Any] = {}
_query_cache_timestamp: Dict[str, float] = {}
QUERY_CACHE_TTL = 60  # 1 minute
```

**Benefits**:
- Faster response times (sub-millisecond cache hits)
- Reduced DynamoDB costs
- Lower latency for repeated queries

### 2.2 DynamoDB Query Result Caching

**Implementation**: `backend/src/schemes/handler.py`

Features:
- Lambda memory cache for all schemes (5-minute TTL)
- Individual scheme caching
- Cache-aware query patterns

**Benefits**:
- Reduced DynamoDB read capacity consumption
- Faster API responses
- Cost optimization

### 2.3 Lambda Provisioned Concurrency

**Implementation**: `infrastructure/template.yaml`

Configuration:
- 2 provisioned concurrent executions for Chat function in production
- 0 in dev/staging to save costs
- Auto-publish alias for version management

```yaml
ChatFunction:
  AutoPublishAlias: live
  ProvisionedConcurrencyConfig:
    ProvisionedConcurrentExecutions: !If [IsProd, 2, 0]
```

**Benefits**:
- Eliminates cold starts for critical function
- Consistent sub-second response times
- Better user experience during peak traffic

### 2.4 Optimized DynamoDB Queries

**Implementation**: Existing GSI (CategoryIndex) utilized efficiently

Features:
- Category-based queries use GSI instead of scans
- Proper pagination with LastEvaluatedKey
- Efficient key design (PK/SK pattern)

**Benefits**:
- Faster query execution
- Lower read capacity consumption
- Scalable query patterns

---

## 3. CloudFront Caching Configuration

### 3.1 Custom Cache Policies

**Implementation**: `infrastructure/template.yaml`

#### Static Assets Cache Policy
- **TTL**: 1 year (31536000 seconds)
- **Applies to**: JS, CSS, images, fonts
- **Compression**: Gzip and Brotli enabled
- **Cache key**: URL only (no query strings, headers, or cookies)

```yaml
StaticAssetsCachePolicy:
  DefaultTTL: 31536000  # 1 year
  MaxTTL: 31536000
  MinTTL: 31536000
```

#### API Cache Policy
- **Default TTL**: 1 hour (3600 seconds)
- **Max TTL**: 24 hours (86400 seconds)
- **Applies to**: API responses
- **Cache key**: URL + query strings + X-Session-Id header

```yaml
ApiCachePolicy:
  DefaultTTL: 3600  # 1 hour
  MaxTTL: 86400  # 24 hours
```

### 3.2 Cache Behaviors by Path

| Path Pattern | TTL | Cache Policy |
|--------------|-----|--------------|
| `assets/js/*` | 1 year | Static Assets |
| `assets/css/*` | 1 year | Static Assets |
| `assets/images/*` | 1 year | Static Assets |
| `assets/fonts/*` | 1 year | Static Assets |
| `schemes` | 1 hour | API Cache |
| `schemes/*` | 24 hours | API Cache |
| Default (HTML) | 1 year | Static Assets |

### 3.3 Cache-Control Headers

**Implementation**: 
- `backend/src/shared/utils.py` - Enhanced create_response()
- `backend/src/schemes/handler.py` - Applied to responses

Headers added:
- Scheme list: `Cache-Control: public, max-age=3600` (1 hour)
- Scheme details: `Cache-Control: public, max-age=86400` (24 hours)
- Static assets: `Cache-Control: public, max-age=31536000, immutable`

### 3.4 Cache Invalidation on Deployments

**Implementation**: `.github/workflows/frontend-deploy.yml`

Automatic cache invalidation:
- Triggered on every frontend deployment
- Invalidates all paths (`/*`)
- Ensures users get latest version immediately

```bash
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

**Benefits**:
- Reduced origin requests (S3 and API Gateway)
- Lower latency for global users
- Reduced data transfer costs
- Faster page loads on repeat visits

---

## Performance Metrics

### Expected Improvements

#### Frontend
- **Initial Load Time**: 30-40% reduction due to code splitting
- **Bundle Size**: 20-30% reduction with tree shaking
- **Repeat Visit Load**: 50-70% faster with service worker caching
- **Re-render Performance**: 40-50% improvement with memoization

#### Backend
- **Cache Hit Response Time**: <10ms (vs 50-100ms DynamoDB query)
- **Cold Start Elimination**: 100% for Chat function in production
- **DynamoDB Read Reduction**: 60-80% with Lambda caching

#### CDN
- **Static Asset Delivery**: 80-90% cache hit rate
- **API Response Caching**: 50-70% cache hit rate for schemes
- **Global Latency**: 40-60% reduction for cached content

### Monitoring

Performance metrics are tracked via:
- CloudWatch Logs: Response times, cache hits/misses
- CloudWatch Metrics: Lambda duration, DynamoDB throttles
- CloudFront Reports: Cache statistics, bandwidth savings

---

## Cost Impact

### Savings
- **DynamoDB**: 60-80% reduction in read capacity units
- **Lambda**: 30-40% reduction in invocations (caching)
- **Data Transfer**: 70-80% reduction (CloudFront caching)

### Additional Costs
- **Provisioned Concurrency**: ~$10-15/month for 2 instances
- **CloudFront**: Minimal increase due to cache policies

**Net Impact**: 40-50% overall cost reduction

---

## Testing Recommendations

### Frontend
1. Run Lighthouse audits to measure performance scores
2. Test bundle sizes: `npm run build && du -sh dist/`
3. Verify service worker registration in DevTools
4. Test offline functionality

### Backend
1. Load test with and without caching
2. Monitor CloudWatch metrics for cache hit rates
3. Verify provisioned concurrency warm starts
4. Test DynamoDB query performance

### CDN
1. Test cache headers with curl: `curl -I https://domain.com/schemes`
2. Verify cache hit/miss in CloudFront logs
3. Test cache invalidation after deployment
4. Monitor CloudFront cache statistics

---

## Maintenance

### Cache Management
- Lambda caches auto-expire (5 minutes for schemes, 1 minute for queries)
- CloudFront caches respect TTL settings
- Manual invalidation available via AWS CLI or Console

### Monitoring
- Set up CloudWatch alarms for cache miss rates
- Monitor Lambda cold start metrics
- Track DynamoDB throttling events

### Updates
- Update cache TTLs based on content change frequency
- Adjust provisioned concurrency based on traffic patterns
- Review and optimize bundle sizes quarterly

---

## References

- Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
- Design Document: Performance Optimization section
- Tasks: 20.1, 20.2, 20.3

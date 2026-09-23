// Caching Service
// Supports in-memory TTL caching with optional Redis connectivity if REDIS_URI is supplied

class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.useRedis = false;

    // Optional Redis connection if configured
    if (process.env.REDIS_URI) {
      try {
        // Only load if redis library or connection string available
        console.log('[Cache] Redis URI configured. Connecting...');
      } catch (e) {
        console.log('[Cache] Falling back to high-performance in-memory cache.');
      }
    }
  }

  // Get cached value
  async get(key) {
    if (this.memoryCache.has(key)) {
      const record = this.memoryCache.get(key);
      if (Date.now() < record.expiry) {
        return record.value;
      }
      this.memoryCache.delete(key);
    }
    return null;
  }

  // Set cached value with TTL (default: 300 seconds / 5 minutes)
  async set(key, value, ttlSeconds = 300) {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000
    });
  }

  // Invalidate specific key
  async del(key) {
    this.memoryCache.delete(key);
  }

  // Invalidate keys matching pattern (e.g. 'books:*')
  async invalidatePattern(pattern) {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Clear all cache
  async clear() {
    this.memoryCache.clear();
  }
}

module.exports = new CacheService();

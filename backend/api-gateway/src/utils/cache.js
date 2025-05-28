/**
 * Cache utility for API Gateway
 * Provides in-memory caching for frequently accessed data
 */

// Simple in-memory cache
// In a production environment, this should be replaced with Redis or another distributed cache
const cache = new Map();

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
const set = (key, value, ttl = 300) => {
  // Calculate expiry time
  const expiresAt = Date.now() + (ttl * 1000);
  
  // Store value and expiry time
  cache.set(key, {
    value,
    expiresAt,
  });
  
  // Set timeout to automatically remove from cache when expired
  setTimeout(() => {
    if (cache.has(key) && cache.get(key).expiresAt <= Date.now()) {
      cache.delete(key);
    }
  }, ttl * 1000);
};

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined if not found or expired
 */
const get = (key) => {
  // Check if key exists
  if (!cache.has(key)) {
    return undefined;
  }
  
  // Get cached item
  const item = cache.get(key);
  
  // Check if item has expired
  if (item.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  
  return item.value;
};

/**
 * Remove a value from the cache
 * @param {string} key - Cache key
 */
const del = (key) => {
  cache.delete(key);
};

/**
 * Clear all values from the cache
 */
const clear = () => {
  cache.clear();
};

/**
 * Get all keys in the cache
 * @returns {string[]} Array of cache keys
 */
const keys = () => {
  return Array.from(cache.keys());
};

/**
 * Get cache stats
 * @returns {Object} Cache statistics
 */
const stats = () => {
  const now = Date.now();
  let activeItems = 0;
  let expiredItems = 0;
  
  for (const [key, item] of cache.entries()) {
    if (item.expiresAt > now) {
      activeItems++;
    } else {
      expiredItems++;
      // Clean up expired items
      cache.delete(key);
    }
  }
  
  return {
    size: cache.size,
    activeItems,
    expiredItems,
  };
};

/**
 * Middleware to cache API responses
 * @param {Object} options - Cache options
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes by default
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    shouldCache = (req) => req.method === 'GET', // Only cache GET requests by default
  } = options;
  
  return (req, res, next) => {
    // Skip caching if shouldCache returns false
    if (!shouldCache(req)) {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator(req);
    
    // Check if response is in cache
    const cachedResponse = get(key);
    if (cachedResponse) {
      // Add cache header
      res.setHeader('X-Cache', 'HIT');
      
      // Return cached response
      return res.status(cachedResponse.status)
        .set(cachedResponse.headers)
        .send(cachedResponse.body);
    }
    
    // Add cache header
    res.setHeader('X-Cache', 'MISS');
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to cache response
    res.send = function(body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Cache response
        set(key, {
          status: res.statusCode,
          headers: res.getHeaders(),
          body,
        }, ttl);
      }
      
      // Call original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = {
  set,
  get,
  del,
  clear,
  keys,
  stats,
  cacheMiddleware,
};

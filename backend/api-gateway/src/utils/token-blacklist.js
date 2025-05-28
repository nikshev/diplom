/**
 * Token blacklist utility for API Gateway
 * Provides functionality to blacklist revoked JWT tokens
 */

// In-memory storage for blacklisted tokens
// In a production environment, this should be replaced with Redis or another distributed cache
const blacklistedTokens = new Map();

/**
 * Add a token to the blacklist
 * @param {string} jti - JWT ID
 * @param {number} exp - Token expiration timestamp (in seconds)
 */
const blacklistToken = (jti, exp) => {
  // Convert exp to milliseconds and calculate TTL
  const expiry = exp * 1000;
  const now = Date.now();
  const ttl = expiry - now;
  
  if (ttl <= 0) {
    // Token already expired, no need to blacklist
    return;
  }
  
  // Add token to blacklist
  blacklistedTokens.set(jti, exp);
  
  // Set timeout to automatically remove from blacklist when expired
  setTimeout(() => {
    blacklistedTokens.delete(jti);
  }, ttl);
};

/**
 * Check if a token is blacklisted
 * @param {string} jti - JWT ID
 * @returns {boolean} True if token is blacklisted
 */
const isTokenBlacklisted = (jti) => {
  return blacklistedTokens.has(jti);
};

/**
 * Remove expired tokens from blacklist
 * This is called periodically to clean up the blacklist
 */
const cleanupBlacklist = () => {
  const now = Date.now() / 1000; // Current time in seconds
  
  for (const [jti, exp] of blacklistedTokens.entries()) {
    if (exp <= now) {
      blacklistedTokens.delete(jti);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupBlacklist, 60 * 60 * 1000);

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
};

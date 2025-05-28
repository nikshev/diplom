/**
 * Security middleware for API Gateway
 * Provides additional security features beyond helmet
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

/**
 * Middleware to add Content Security Policy (CSP) headers
 * @returns {Function} Express middleware
 */
const contentSecurityPolicy = () => {
  return (req, res, next) => {
    // Set CSP headers
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; object-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
    next();
  };
};

/**
 * Middleware to prevent clickjacking attacks
 * @returns {Function} Express middleware
 */
const preventClickjacking = () => {
  return (req, res, next) => {
    // Set X-Frame-Options header
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  };
};

/**
 * Middleware to add security headers
 * @returns {Function} Express middleware
 */
const securityHeaders = () => {
  return (req, res, next) => {
    // Set various security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'; geolocation 'none'");
    res.setHeader('Permissions-Policy', "camera=(), microphone=(), geolocation=()");
    
    // Add nonce for inline scripts if needed
    const nonce = uuidv4();
    res.locals.nonce = nonce;
    
    next();
  };
};

/**
 * Middleware to detect and prevent common attack patterns
 * @returns {Function} Express middleware
 */
const preventAttacks = () => {
  return (req, res, next) => {
    // Check for suspicious query parameters or headers
    const suspiciousPatterns = [
      /script>/i,
      /javascript:/i,
      /eval\(/i,
      /on\w+=/i,
      /union\s+select/i,
      /exec\(/i,
      /SLEEP\(/i,
      /DROP\s+TABLE/i,
    ];
    
    // Check query parameters
    const queryString = JSON.stringify(req.query);
    
    // Check headers (excluding authorization which may contain tokens)
    const headers = { ...req.headers };
    delete headers.authorization;
    const headersString = JSON.stringify(headers);
    
    // Check body if it's a string or can be converted to a string
    let bodyString = '';
    if (req.body) {
      try {
        if (typeof req.body === 'string') {
          bodyString = req.body;
        } else {
          bodyString = JSON.stringify(req.body);
        }
      } catch (error) {
        // Ignore errors when stringifying body
      }
    }
    
    // Check for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (
        pattern.test(queryString) ||
        pattern.test(headersString) ||
        pattern.test(bodyString)
      ) {
        logger.warn(`Potential attack detected from ${req.ip}: ${pattern.toString()}`);
        return res.status(403).json({
          status: 403,
          message: 'Request contains potentially malicious content',
          correlationId: req.correlationId,
        });
      }
    }
    
    next();
  };
};

module.exports = {
  contentSecurityPolicy,
  preventClickjacking,
  securityHeaders,
  preventAttacks,
};

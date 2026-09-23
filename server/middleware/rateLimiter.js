const rateLimit = require('express-rate-limit');

// General API rate limiter: 300 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for Auth routes: 25 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 35,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// AI chat limiter: 20 requests per 5 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'AI Assistant rate limit reached. Please wait a few moments before sending more messages.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter, aiLimiter };

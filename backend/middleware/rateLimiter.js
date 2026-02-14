import rateLimit from 'express-rate-limit';

/**
 * FAIRNESS CONTROL #2: IP-based rate limiting
 * Limits vote attempts per IP address to prevent abuse
 * Prevents: Mass voting from single IP, automated bots
 * Limitation: Users behind same NAT/proxy share IP limit
 */
export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 vote requests per windowMs
  message: {
    error: 'Too many vote attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful responses, only count failed attempts
  skipSuccessfulRequests: false
});

export const createPollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit poll creation to 10 per hour per IP
  message: {
    error: 'Too many polls created from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
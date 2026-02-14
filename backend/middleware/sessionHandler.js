import { v4 as uuidv4 } from 'uuid';

/**
 * Session Handler Middleware
 * Generates and manages session IDs using HTTP-only cookies
 * Used for fairness control to prevent duplicate voting
 */
export const sessionHandler = (req, res, next) => {
  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    // Generate new session ID if none exists
    sessionId = uuidv4();
    
    // Set HTTP-only cookie (cannot be accessed via JavaScript)
    // Secure flag should be true in production (HTTPS only)
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
  }

  req.sessionId = sessionId;
  next();
};
const rateLimit = require('express-rate-limit');

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per 15-minute window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this client. Please try again after 15 minutes.',
  },
});

// Strict Rate Limiter for Authentication (prevents credential stuffing & brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// Appointment Booking Rate Limiter (prevents bot reservation flooding)
const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Booking request limit reached. Please wait before creating more appointments.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  bookingLimiter,
};

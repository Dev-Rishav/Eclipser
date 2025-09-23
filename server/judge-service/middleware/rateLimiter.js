const rateLimit = require('express-rate-limit');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// General API rate limiting
const apiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again after 15 minutes.'
);

// Submission rate limiting - more restrictive
const submissionLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  10, // limit each IP to 10 submissions per 5 minutes
  'Too many submissions, please wait before submitting again.'
);

// Contest creation rate limiting
const contestCreationLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // limit each IP to 5 contest creations per hour
  'Too many contests created, please try again later.'
);

// Problem creation rate limiting
const problemCreationLimiter = createRateLimit(
  30 * 60 * 1000, // 30 minutes
  10, // limit each IP to 10 problem creations per 30 minutes
  'Too many problems created, please try again later.'
);

module.exports = {
  apiLimiter,
  submissionLimiter,
  contestCreationLimiter,
  problemCreationLimiter
};

import rateLimit from "express-rate-limit";

// LOGIN RATE LIMITER → 5 attempts in 15 minutes
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: "Too many login attempts, try again after 15 minutes.",
  },
});

// UPDATE PASSWORD RATE LIMITER → 5 attempts in 30 minutes
export const updatePasswordRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    error: "Too many update password attempts, try again after 30 minutes.",
  },
});

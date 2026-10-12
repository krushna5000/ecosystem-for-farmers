import rateLimit from "express-rate-limit";

// SuperAdmin login: Max 5 attempts / 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

// Create admin: Max 3 attempts / 10 minutes (defined in the original but not mounted on any route)
export const createAdminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 3,
  message: {
    success: false,
    message: "Too many admin creation attempts. Try again later.",
  },
});

import rateLimit from "express-rate-limit";

// General API limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // max 100 requests per IP
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

// Strict limiter (for sensitive routes like login)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // only 5 attempts
    message: {
        success: false,
        message: "Too many login attempts, try later"
    }
});
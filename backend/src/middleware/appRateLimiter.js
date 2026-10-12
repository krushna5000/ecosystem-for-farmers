import rateLimit from "express-rate-limit";

export const sendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 10 minutes before trying again.",
  },
});

export const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please wait 10 minutes before trying again.",
  },
});

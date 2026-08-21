import { Router } from "express";
import {
  vendorLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  vendorLogout,
  refreshVendorToken
} from "../controllers/vendorAuthController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { loginLimiter, forgotPasswordLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Vendor Login
router.post("/login", loginLimiter, vendorLogin);

// Check if vendor is authenticated
router.get("/check-auth", authenticateVendor, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  res.json({
    authenticated: true,
    user: req.vendor || null,
  });
});

// Forgot Password
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Reset Password
router.post("/reset-password", resetPassword);
router.post("/logout", vendorLogout);

//refresh access token
router.post("/refresh", refreshVendorToken)

export default router;

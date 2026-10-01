import { Router } from "express";
import {
  vendorLogin,
  checkAuth,
  forgotPassword,
  verifyOTP,
  resetPassword,
  vendorLogout,
  refreshVendorToken,
} from "../controllers/vendorAuthController.js";
import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { loginLimiter, forgotPasswordLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", loginLimiter, vendorLogin);
router.get("/check-auth", authenticateVendor, checkAuth);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", vendorLogout);
router.post("/refresh", refreshVendorToken);

export default router;

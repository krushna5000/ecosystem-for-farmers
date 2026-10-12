import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { loginLimiter, forgotPasswordLimiter } from "../../middleware/vendorRateLimiter.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import {
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "./vendorAuth.validator.js";
import * as vendorAuthController from "./vendorAuth.controller.js";

// Mounted at /api/vendor-portal/vendor (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("flag"));

router.post("/login", loginLimiter, validate(loginSchema), vendorAuthController.vendorLogin);
router.get("/check-auth", authenticateVendor, vendorAuthController.checkAuth);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  vendorAuthController.forgotPassword,
);
router.post("/verify-otp", validate(verifyOtpSchema), vendorAuthController.verifyOTP);
router.post("/reset-password", validate(resetPasswordSchema), vendorAuthController.resetPassword);
router.post("/logout", vendorAuthController.vendorLogout);
router.post("/refresh", vendorAuthController.refreshVendorToken);

export default router;

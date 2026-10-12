import { Router } from "express";
import { authenticateApp, detectUserType } from "../../middleware/appAuth.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../../middleware/appRateLimiter.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import {
  registerSendOtpSchema,
  registerVerifyOtpSchema,
  loginSendOtpSchema,
  loginVerifyOtpSchema,
  updateProfileSchema,
} from "./appAuth.validator.js";
import * as appAuthController from "./appAuth.controller.js";

// Mounted at /api/app/auth (routes/app.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// Rate limiters run before validation so invalid attempts count too.
router.post(
  "/register/send-otp",
  detectUserType,
  sendOtpLimiter,
  validate(registerSendOtpSchema),
  appAuthController.registerSendOtp,
);
router.post("/register/verify-otp", verifyOtpLimiter, validate(registerVerifyOtpSchema), appAuthController.registerVerifyOtp);
router.post("/login/send-otp", sendOtpLimiter, validate(loginSendOtpSchema), appAuthController.loginSendOtp);
router.post("/login/verify-otp", verifyOtpLimiter, validate(loginVerifyOtpSchema), appAuthController.loginVerifyOtp);
router.post("/logout", appAuthController.logout);
router.get("/verify-auth", authenticateApp, appAuthController.verifyAuth);
router.get("/profile", authenticateApp, appAuthController.getProfile);
router.put("/profile", authenticateApp, validate(updateProfileSchema), appAuthController.updateProfile);

export default router;

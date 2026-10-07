import { Router } from "express";
import authController from "./auth.controller.js";
import authMiddleware, { detectUserType } from "../../../middleware/app/authMiddleware.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../../../middleware/app/rateLimiter.js";

// Mounted at /auth
const router = Router();

router.post("/register/send-otp", detectUserType, sendOtpLimiter, authController.registerSendOtp);
router.post("/register/verify-otp", verifyOtpLimiter, authController.registerVerifyOtp);
router.post("/login/send-otp", sendOtpLimiter, authController.loginSendOtp);
router.post("/login/verify-otp", verifyOtpLimiter, authController.loginVerifyOtp);
router.post("/logout", authController.logout);
router.get("/verify-auth", authMiddleware, authController.verifyAuth);
router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);

export default router;

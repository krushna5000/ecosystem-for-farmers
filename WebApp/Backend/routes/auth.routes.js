import express from "express";
import controller from "../controllers/authController.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";
import authMiddleware, {
  detectUserType,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/send-otp", detectUserType, sendOtpLimiter, controller.registerSendOtp);
router.post(
  "/register/verify-otp",
  verifyOtpLimiter,
  controller.registerVerifyOtp
);

// http://localhost:5000/api/auth/login/send-otp
router.post("/login/send-otp", sendOtpLimiter, controller.loginSendOtp);
// http://localhost:5000/api/auth/login/verify-otp
router.post("/login/verify-otp", verifyOtpLimiter, controller.loginVerifyOtp);
router.post("/logout", controller.logout);

router.get("/verify-auth", authMiddleware, controller.verifyAuth);

// Profile endpoints
router.get("/profile", authMiddleware, controller.getProfile);
router.put("/profile", authMiddleware, controller.updateProfile);

export default router;

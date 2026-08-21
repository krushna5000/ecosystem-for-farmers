import express from "express";
import controller from "../controllers/authController.js";
import { sendOtpLimiter, verifyOtpLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register/send-otp", sendOtpLimiter, controller.registerSendOtp);
router.post("/register/verify-otp",verifyOtpLimiter,controller.registerVerifyOtp
);
router.post("/login/send-otp", sendOtpLimiter, controller.loginSendOtp);
router.post("/login/verify-otp", verifyOtpLimiter, controller.loginVerifyOtp);
router.post("/logout", controller.logout);

router.get("/verify-auth", authMiddleware, controller.verifyAuth);
router.get("/profile", authMiddleware, controller.getProfile);

export default router;

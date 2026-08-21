import express from "express";
import {
  sendVendorOtp,
  verifyVendorOtp
} from "../controllers/vendorOtpController.js";

const router = express.Router();

router.post("/vendors/otp/send", sendVendorOtp);
router.post("/vendors/otp/verify", verifyVendorOtp);

export default router;

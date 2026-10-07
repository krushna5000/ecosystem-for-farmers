import express from "express";
import {
  sendOtpToCompany,
  verifyCompanyOtp,
} from "./companyOtp.controller.js";

const router = express.Router();

router.post("/otp/send", sendOtpToCompany);
router.post("/otp/verify", verifyCompanyOtp);

export default router;

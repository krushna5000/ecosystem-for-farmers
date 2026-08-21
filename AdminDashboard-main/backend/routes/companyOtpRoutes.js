import express from "express";
import {
  sendOtpToCompany,
  verifyCompanyOtp
} from "../controllers/companyOtpController.js";

const router = express.Router();

router.post("/companies/otp/send", sendOtpToCompany);
router.post("/companies/otp/verify", verifyCompanyOtp);

export default router;

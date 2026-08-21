import express from "express";
import {
  sendOtpToCompany,
  verifyCompanyOtp,
} from "../controllers/companyOtpController.js";

const router = express.Router();

router.post("/otp/send", sendOtpToCompany);
router.post("/otp/verify", verifyCompanyOtp);

export default router;

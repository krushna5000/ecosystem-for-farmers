import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import upload from "../middleware/upload.js";

import {
  addCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  toggleCompanyActive,
  verifyCompanyEmail,
  resetCompanyPassword,
  bulkDeleteCompanies,
} from "../controllers/companyController.js";
import {
  sendOtpToCompany,
  verifyCompanyOtp,
} from "../controllers/companyOtpController.js";

const router = express.Router();

router.post("/add-company", adminAuth, upload.single("logo"), addCompany);

router.get("/", adminAuth, getAllCompanies);
router.get("/:id", adminAuth, getCompanyById);
router.put("/:id", adminAuth, upload.single("logo"), updateCompany);
router.delete("/:id", adminAuth, deleteCompany);
router.post("/bulk-delete", adminAuth, bulkDeleteCompanies);
router.patch("/:id/toggle-active", adminAuth, toggleCompanyActive);

router.post("/otp/send", sendOtpToCompany);
router.post("/otp/verify", verifyCompanyOtp);

router.get("/company/verify-email/:token", verifyCompanyEmail);
router.post("/company/reset-password/:token", resetCompanyPassword);

export default router;

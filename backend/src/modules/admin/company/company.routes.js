import express from "express";
import { adminAuth } from "../../../middleware/admin/adminAuth.js";
import upload from "../../../middleware/admin/upload.js";

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
} from "./company.controller.js";
import {
  sendOtpToCompany,
  verifyCompanyOtp,
} from "../companyOtp/companyOtp.controller.js";

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

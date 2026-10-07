import express from "express";
import { adminAuth } from "../../../middleware/admin/adminAuth.js";
import { uploadVendorDocs } from "../../../middleware/admin/multerConfig.js";
import {
  addVendorWithDocs,
  updateVendorWithDocs,
  getAllVendorsWithDocs,
  deleteVendorWithDocs,
  toggleVendorActive,
  verifyVendorEmail,
  resetVendorPassword,
  bulkDeleteVendors,
} from "./vendor.controller.js";
import { sendVendorOtp, verifyVendorOtp } from "../vendorOtp/vendorOtp.controller.js";

const router = express.Router();

// Create Vendor + PDFs
router.post("/", adminAuth, uploadVendorDocs, addVendorWithDocs);

router.get("/", adminAuth, getAllVendorsWithDocs);

router.put("/:id", adminAuth, uploadVendorDocs, updateVendorWithDocs);

router.delete("/:id", adminAuth, deleteVendorWithDocs);

router.post("/bulk-delete", adminAuth, bulkDeleteVendors);

router.patch("/:id/toggle-active", adminAuth, toggleVendorActive);
router.get("/verify-email/:token", verifyVendorEmail);

router.post("/reset-password/:token", resetVendorPassword);

router.post("/otp/send", sendVendorOtp);
router.post("/otp/verify", verifyVendorOtp);

export default router;

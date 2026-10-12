import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import { uploadVendorDocs } from "../../middleware/adminMulterConfig.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  addVendorSchema,
  updateVendorSchema,
  resetPasswordSchema,
  bulkDeleteSchema,
} from "./adminVendor.validator.js";
import * as adminVendorController from "./adminVendor.controller.js";
// The legacy vendor routes also served the vendor-OTP handlers under /vendors/otp/*.
import { sendVendorOtpSchema, verifyVendorOtpSchema } from "../adminVendorOtp/adminVendorOtp.validator.js";
import * as adminVendorOtpController from "../adminVendorOtp/adminVendorOtp.controller.js";

// Mounted at /api/admin/vendors (routes/admin.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// Create Vendor + PDFs
router.post(
  "/",
  adminAuth,
  uploadVendorDocs,
  validate(addVendorSchema),
  adminVendorController.addVendorWithDocs,
);

router.get("/", adminAuth, validateQuery(listQuerySchema), adminVendorController.getAllVendorsWithDocs);

router.put(
  "/:id",
  adminAuth,
  uploadVendorDocs,
  validateParams(idParamSchema),
  validate(updateVendorSchema),
  adminVendorController.updateVendorWithDocs,
);

router.delete("/:id", adminAuth, validateParams(idParamSchema), adminVendorController.deleteVendorWithDocs);

router.post("/bulk-delete", adminAuth, validate(bulkDeleteSchema), adminVendorController.bulkDeleteVendors);

router.patch(
  "/:id/toggle-active",
  adminAuth,
  validateParams(idParamSchema),
  adminVendorController.toggleVendorActive,
);
router.get("/verify-email/:token", adminVendorController.verifyVendorEmail);

router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  adminVendorController.resetVendorPassword,
);

router.post("/otp/send", validate(sendVendorOtpSchema), adminVendorOtpController.sendVendorOtp);
router.post("/otp/verify", validate(verifyVendorOtpSchema), adminVendorOtpController.verifyVendorOtp);

export default router;

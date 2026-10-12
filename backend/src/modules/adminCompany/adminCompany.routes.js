import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import { uploadCompanyLogo } from "../../middleware/adminUpload.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  addCompanySchema,
  updateCompanySchema,
  resetPasswordSchema,
  bulkDeleteSchema,
} from "./adminCompany.validator.js";
import * as adminCompanyController from "./adminCompany.controller.js";
// The legacy company routes also served the company-OTP handlers under /companies/otp/*.
import { sendCompanyOtpSchema, verifyCompanyOtpSchema } from "../adminCompanyOtp/adminCompanyOtp.validator.js";
import * as adminCompanyOtpController from "../adminCompanyOtp/adminCompanyOtp.controller.js";

// Mounted at /api/admin/companies (routes/admin.routes.js)
const router = Router();

router.use(responseStyle("flag"));

router.post(
  "/add-company",
  adminAuth,
  uploadCompanyLogo,
  validate(addCompanySchema),
  adminCompanyController.addCompany,
);

router.get("/", adminAuth, validateQuery(listQuerySchema), adminCompanyController.getAllCompanies);
router.get("/:id", adminAuth, validateParams(idParamSchema), adminCompanyController.getCompanyById);
router.put(
  "/:id",
  adminAuth,
  uploadCompanyLogo,
  validateParams(idParamSchema),
  validate(updateCompanySchema),
  adminCompanyController.updateCompany,
);
router.delete("/:id", adminAuth, validateParams(idParamSchema), adminCompanyController.deleteCompany);
router.post("/bulk-delete", adminAuth, validate(bulkDeleteSchema), adminCompanyController.bulkDeleteCompanies);
router.patch(
  "/:id/toggle-active",
  adminAuth,
  validateParams(idParamSchema),
  adminCompanyController.toggleCompanyActive,
);

router.post("/otp/send", validate(sendCompanyOtpSchema), adminCompanyOtpController.sendOtpToCompany);
router.post("/otp/verify", validate(verifyCompanyOtpSchema), adminCompanyOtpController.verifyCompanyOtp);

router.get("/company/verify-email/:token", adminCompanyController.verifyCompanyEmail);
router.post(
  "/company/reset-password/:token",
  validate(resetPasswordSchema),
  adminCompanyController.resetCompanyPassword,
);

export default router;

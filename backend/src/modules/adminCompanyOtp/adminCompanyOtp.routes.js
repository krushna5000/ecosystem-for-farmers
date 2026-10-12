import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { sendCompanyOtpSchema, verifyCompanyOtpSchema } from "./adminCompanyOtp.validator.js";
import * as adminCompanyOtpController from "./adminCompanyOtp.controller.js";

// Mounted at /api/admin/company-otp (routes/admin.routes.js). Public, as it always was.
// adminCompany.routes.js re-mounts the same handlers under /api/admin/companies/otp/*.
const router = Router();

router.use(responseStyle("flag"));

router.post("/otp/send", validate(sendCompanyOtpSchema), adminCompanyOtpController.sendOtpToCompany);
router.post("/otp/verify", validate(verifyCompanyOtpSchema), adminCompanyOtpController.verifyCompanyOtp);

export default router;

import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { sendVendorOtpSchema, verifyVendorOtpSchema } from "./adminVendorOtp.validator.js";
import * as adminVendorOtpController from "./adminVendorOtp.controller.js";

// Mounted at /api/admin/vendor-otp (routes/admin.routes.js). Public, as it always was.
// adminVendor.routes.js re-mounts the same handlers under /api/admin/vendors/otp/*.
const router = Router();

router.use(responseStyle("flag"));

router.post("/vendors/otp/send", validate(sendVendorOtpSchema), adminVendorOtpController.sendVendorOtp);
router.post("/vendors/otp/verify", validate(verifyVendorOtpSchema), adminVendorOtpController.verifyVendorOtp);

export default router;

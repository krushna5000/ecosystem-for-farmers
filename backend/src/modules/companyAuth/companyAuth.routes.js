import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { loginRateLimiter, updatePasswordRateLimiter } from "../../middleware/companyRateLimiter.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema, updatePasswordSchema } from "./companyAuth.validator.js";
import * as companyAuthController from "./companyAuth.controller.js";

// Mounted at /api/company-portal/company (routes/company.routes.js)
const router = Router();

router.use(responseStyle("flag"));

router.post("/login", loginRateLimiter, validate(loginSchema), companyAuthController.companyLogin);
router.put(
  "/update-password",
  verifyCompanyToken,
  updatePasswordRateLimiter,
  validate(updatePasswordSchema),
  companyAuthController.updatePassword,
);
router.get("/profile", verifyCompanyToken, companyAuthController.getCompanyProfile);
// Logout has always been public.
router.post("/logout", companyAuthController.companyLogout);

export default router;

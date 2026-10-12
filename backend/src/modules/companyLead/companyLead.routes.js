import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams } from "../../middleware/validate.js";
import { idParamsSchema, updateLeadStatusSchema } from "./companyLead.validator.js";
import * as companyLeadController from "./companyLead.controller.js";

// Mounted at /api/company-portal/company/leads (routes/company.routes.js)
const router = Router();

router.use(responseStyle("flag"));
router.use(verifyCompanyToken);

router.get("/", companyLeadController.getAllLeads);
// The status is checked first ("Invalid status") — the id was never validated before it.
router.patch(
  "/:id",
  validate(updateLeadStatusSchema),
  validateParams(idParamsSchema),
  companyLeadController.updateLeadStatus,
);

export default router;

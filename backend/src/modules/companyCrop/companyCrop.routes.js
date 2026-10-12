import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validateQuery } from "../../middleware/validate.js";
import { listQuerySchema } from "./companyCrop.validator.js";
import * as companyCropController from "./companyCrop.controller.js";

// Mounted at /api/company-portal/crops (routes/company.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// Company authentication
router.use(verifyCompanyToken);
router.get("/", validateQuery(listQuerySchema), companyCropController.getAllCrops);

export default router;

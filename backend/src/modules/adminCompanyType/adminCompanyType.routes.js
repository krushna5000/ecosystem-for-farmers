import { Router } from "express";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  createCompanyTypeSchema,
  updateCompanyTypeSchema,
} from "./adminCompanyType.validator.js";
import * as adminCompanyTypeController from "./adminCompanyType.controller.js";

// Mounted at /api/admin/company-types (routes/admin.routes.js). Unauthenticated, as it always was.
const router = Router();

router.use(responseStyle("flag"));

router.post("/", validate(createCompanyTypeSchema), adminCompanyTypeController.createCompanyType);
router.get("/", validateQuery(listQuerySchema), adminCompanyTypeController.getCompanyTypes);
router.put(
  "/:id",
  validateParams(idParamSchema),
  validate(updateCompanyTypeSchema),
  adminCompanyTypeController.updateCompanyType,
);
router.delete("/:id", validateParams(idParamSchema), adminCompanyTypeController.deleteCompanyType);

export default router;

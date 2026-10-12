import { Router } from "express";
import { verifyCompanyToken } from "../../middleware/companyAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  idParamsSchema,
  listQuerySchema,
  createCompanyInventorySchema,
  updateCompanyInventorySchema,
  bulkDeleteSchema,
} from "./companyInventory.validator.js";
import * as companyInventoryController from "./companyInventory.controller.js";

// Mounted at /api/company-portal/company/inventory (routes/company.routes.js)
const router = Router();

router.use(responseStyle("flag"));
router.use(verifyCompanyToken);

// Specific paths before /:id
router.post(
  "/bulk-delete",
  validate(bulkDeleteSchema),
  companyInventoryController.deleteCompanyInventories,
);
router.post(
  "/",
  validate(createCompanyInventorySchema),
  companyInventoryController.createCompanyInventory,
);
router.get("/", validateQuery(listQuerySchema), companyInventoryController.getCompanyInventoryList);
router.get("/:id", validateParams(idParamsSchema), companyInventoryController.getCompanyInventoryById);
// The body is checked first ("quantity is required") — the id was never validated before it.
router.put(
  "/:id",
  validate(updateCompanyInventorySchema),
  validateParams(idParamsSchema),
  companyInventoryController.updateCompanyInventory,
);
router.delete("/:id", validateParams(idParamsSchema), companyInventoryController.deleteCompanyInventory);

export default router;

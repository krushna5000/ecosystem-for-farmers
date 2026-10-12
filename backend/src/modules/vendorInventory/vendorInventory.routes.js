import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams } from "../../middleware/validate.js";
import {
  idParamSchema,
  createVendorInventorySchema,
  updateVendorInventorySchema,
} from "./vendorInventory.validator.js";
import * as vendorInventoryController from "./vendorInventory.controller.js";

// Mounted at /api/vendor-portal/inventory (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("status"));
router.use(authenticateVendor);

router.post("/", validate(createVendorInventorySchema), vendorInventoryController.createInventory);
router.get("/", vendorInventoryController.getInventoryList);
router.get("/:id", validateParams(idParamSchema), vendorInventoryController.getInventoryById);
// Body first: the old handler checked `quantity` before it ever looked at the id.
router.put(
  "/:id",
  validate(updateVendorInventorySchema),
  validateParams(idParamSchema),
  vendorInventoryController.updateInventory,
);
router.delete("/:id", validateParams(idParamSchema), vendorInventoryController.deleteInventory);

export default router;

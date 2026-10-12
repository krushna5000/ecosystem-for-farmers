import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams } from "../../middleware/validate.js";
import {
  idParamSchema,
  vendorIdParamSchema,
  createServiceLocationSchema,
} from "./vendorServiceLocation.validator.js";
import * as vendorServiceLocationController from "./vendorServiceLocation.controller.js";

// Mounted at /api/vendor-portal/service-locations (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("flag"));
// All routes require vendor authentication
router.use(authenticateVendor);

router.post("/", validate(createServiceLocationSchema), vendorServiceLocationController.createServiceLocation);
router.get(
  "/:vendor_id",
  validateParams(vendorIdParamSchema),
  vendorServiceLocationController.getServiceLocations,
);
router.get(
  "/location/:id",
  validateParams(idParamSchema),
  vendorServiceLocationController.getServiceLocationById,
);
router.put("/:id", validateParams(idParamSchema), vendorServiceLocationController.updateServiceLocation);
router.delete("/:id", validateParams(idParamSchema), vendorServiceLocationController.deleteServiceLocation);

export default router;

import { Router } from "express";
import { authenticateVendor } from "../../middleware/vendorAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import * as vendorCropController from "./vendorCrop.controller.js";

// Mounted at /api/vendor-portal/crops (routes/vendor.routes.js)
const router = Router();

router.use(responseStyle("flag"));
router.use(authenticateVendor);

router.get("/", vendorCropController.getAllCrops);

export default router;

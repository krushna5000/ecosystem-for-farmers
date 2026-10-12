import { Router } from "express";
import { authMiddleware } from "../../middleware/superAdminAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams, validateQuery } from "../../middleware/validate.js";
import { idParamSchema, listQuerySchema, bulkDeleteSchema } from "./superAdminCrop.validator.js";
import * as superAdminCropController from "./superAdminCrop.controller.js";

// Mounted at /api/super-admin/crops (routes/superAdmin.routes.js). Auth is applied per route, as before.
const router = Router();

router.use(responseStyle("flag"));

router.post("/add", authMiddleware, superAdminCropController.addCrop);
router.get("/all", authMiddleware, validateQuery(listQuerySchema), superAdminCropController.getAllCrops);
router.delete("/bulk-delete", authMiddleware, validate(bulkDeleteSchema), superAdminCropController.bulkDeleteCrops);
router.put("/update/:id", authMiddleware, validateParams(idParamSchema), superAdminCropController.updateCrop);
router.delete("/delete/:id", authMiddleware, validateParams(idParamSchema), superAdminCropController.deleteCrop);

export default router;

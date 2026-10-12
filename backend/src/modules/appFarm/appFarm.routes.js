import { Router } from "express";
import { authenticateApp, validateFieldRequest } from "../../middleware/appAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { addFarmSchema, addFarmCropSchema } from "./appFarm.validator.js";
import * as appFarmController from "./appFarm.controller.js";
import { getFieldIndices } from "../appIndexes/appIndexes.controller.js";

// Mounted at /api/app/farms (routes/app.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// Farm APIs
router.post("/add-farm", authenticateApp, validate(addFarmSchema), appFarmController.addFarm);
router.get("/get-farms/:user_id", authenticateApp, appFarmController.getFarmsByUser);
router.get("/get-farm/:farm_id", authenticateApp, appFarmController.getFarmById);
router.put("/update-farm/:farm_id", authenticateApp, appFarmController.updateFarm);
router.delete("/delete-farm/:farm_id", authenticateApp, appFarmController.deleteFarm);
router.get("/get-all-pincodes", authenticateApp, appFarmController.getAllPincodes);
// satellite index series for a field — the handler belongs to the indexes module (no JWT, as before)
router.get("/indices/:fieldId", validateFieldRequest, getFieldIndices);

// Farm Crop APIs
router.get("/get-all-crops", authenticateApp, appFarmController.getAllCrops);
router.post("/add-farm-crop", authenticateApp, validate(addFarmCropSchema), appFarmController.addFarmCrop);
router.get("/get-farm-crops/:farm_id", authenticateApp, appFarmController.getFarmCropsByFarm);
router.get("/get-farm-crops-by-user/:user_id", authenticateApp, appFarmController.getFarmCropsByUser);
router.get("/get-farm-crop/:id", authenticateApp, appFarmController.getFarmCropById);
router.put("/update-farm-crop/:id", authenticateApp, appFarmController.updateFarmCrop);
router.delete("/delete-farm-crop/:id", authenticateApp, appFarmController.deleteFarmCrop);
router.get("/pincode-boundary/:pincode", authenticateApp, appFarmController.pincodeBoundary);

export default router;

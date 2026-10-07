import { Router } from "express";
import farmController from "./farm.controller.js";
import { pincodeBoundary } from "./pincodeBoundary.controller.js";
import { getFieldIndices } from "../indexes/indexes.controller.js";
import authMiddleware, { validateFieldRequest } from "../../../middleware/app/authMiddleware.js";

// Mounted at /farms
const router = Router();

// Farm APIs
router.post("/add-farm", authMiddleware, farmController.addFarm);
router.get("/get-farms/:user_id", authMiddleware, farmController.getFarmsByUser);
router.get("/get-farm/:farm_id", authMiddleware, farmController.getFarmById);
router.put("/update-farm/:farm_id", authMiddleware, farmController.updateFarm);
router.delete("/delete-farm/:farm_id", authMiddleware, farmController.deleteFarm);
router.get("/get-all-pincodes", authMiddleware, farmController.getAllPincodes);
router.get("/indices/:fieldId", validateFieldRequest, getFieldIndices);
// Farm Crop APIs
router.get("/get-all-crops", authMiddleware, farmController.getAllCrops);
router.post("/add-farm-crop", authMiddleware, farmController.addFarmCrop);
router.get("/get-farm-crops/:farm_id", authMiddleware, farmController.getFarmCropsByFarm);
router.get("/get-farm-crops-by-user/:user_id", authMiddleware, farmController.getFarmCropsByUser);
router.get("/get-farm-crop/:id", authMiddleware, farmController.getFarmCropById);
router.put("/update-farm-crop/:id", authMiddleware, farmController.updateFarmCrop);
router.delete("/delete-farm-crop/:id", authMiddleware, farmController.deleteFarmCrop);
router.get("/pincode-boundary/:pincode", authMiddleware, pincodeBoundary);

export default router;

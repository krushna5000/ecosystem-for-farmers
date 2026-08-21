import express from "express";
import controller from "../controllers/farmController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateFieldRequest } from "../middleware/authMiddleware.js";
import { getFieldIndices } from "../controllers/indexesController.js";
import { pincodeBoundary } from "../controllers/pincodeBoundary.js";

const router = express.Router();

// Farm APIs
router.post("/add-farm", authMiddleware, controller.addFarm);
router.get("/get-farms/:user_id", authMiddleware, controller.getFarmsByUser);
router.get("/get-farm/:farm_id", authMiddleware, controller.getFarmById);
router.put("/update-farm/:farm_id", authMiddleware, controller.updateFarm);
router.delete("/delete-farm/:farm_id", authMiddleware, controller.deleteFarm);
router.get("/get-all-pincodes", authMiddleware, controller.getAllPincodes);
router.get("/indices/:fieldId", validateFieldRequest, getFieldIndices);

// Farm Crop APIs
router.get("/get-all-crops", authMiddleware, controller.getAllCrops);
router.post("/add-farm-crop", authMiddleware, controller.addFarmCrop);
router.get(
  "/get-farm-crops/:farm_id",
  authMiddleware,
  controller.getFarmCropsByFarm,
);
router.get(
  "/get-farm-crops-by-user/:user_id",
  authMiddleware,
  controller.getFarmCropsByUser,
);
router.get("/get-farm-crop/:id", authMiddleware, controller.getFarmCropById);
router.put("/update-farm-crop/:id", authMiddleware, controller.updateFarmCrop);
router.delete(
  "/delete-farm-crop/:id",
  authMiddleware,
  controller.deleteFarmCrop,
);

router.get(
  "/pincode-boundary/:pincode",
  authMiddleware,
  pincodeBoundary,
);

export default router;

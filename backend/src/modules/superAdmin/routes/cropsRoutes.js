import express from "express";
import { addCrop, updateCrop, deleteCrop, getAllCrops, bulkDeleteCrops } from "../controllers/cropsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", authMiddleware, addCrop);
router.get("/all", authMiddleware, getAllCrops);
router.delete("/bulk-delete", authMiddleware, bulkDeleteCrops);
router.put("/update/:id", authMiddleware, updateCrop);
router.delete("/delete/:id", authMiddleware, deleteCrop);

export default router;

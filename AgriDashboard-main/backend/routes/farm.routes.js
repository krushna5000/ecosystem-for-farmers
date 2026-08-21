import express from "express";
import farmController from "../controllers/farm.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { validateFarm, validateFarmUpdate } from "../middlewares/farm.middleware.js";

const router = express.Router();

router.post("/", verifyToken, validateFarm, farmController.addFarm);
router.get("/:user_id", verifyToken, farmController.getFarmsByUser);
router.get("/farm/:farm_id", verifyToken, farmController.getFarmById);
router.put("/:farm_id", verifyToken, validateFarmUpdate, farmController.updateFarm);
router.delete("/:farm_id", verifyToken, farmController.deleteFarm);

export default router;
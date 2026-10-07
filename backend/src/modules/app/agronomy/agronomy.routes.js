import { Router } from "express";
import { agronomyInference } from "./agronomy.controller.js";
import { getAllCrops } from "./crop.controller.js";

// Crop lifecycle stage model — mounted at /CLSM
const router = Router();

router.post("/infer", agronomyInference);
router.get("/get-all-crops", getAllCrops);

export default router;

import express from "express";
import { agronomyInference } from "../mongoControllers/agronomy.controller.js";
import { getAllCrops } from "../mongoControllers/crop.controller.js";

const router = express.Router();

router.post("/infer", agronomyInference);
router.get("/get-all-crops", getAllCrops);

export default router;

import { Router } from "express";
import { submitFarm } from "../controllers/farm.controller.js";

const router = Router();

// POST /api/farm
router.post("/", submitFarm);

export default router;

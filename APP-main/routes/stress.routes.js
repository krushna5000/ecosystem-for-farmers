import express from "express";
import { calculateStress } from "../controllers/stressController.js";

const router = express.Router();

router.get("/stress/:fieldId/:date", calculateStress);

export default router;

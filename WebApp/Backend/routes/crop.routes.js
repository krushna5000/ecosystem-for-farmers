import express from "express";
import analyzeCrop from "../controllers/cropController.js";
import { parseMultipart } from "../middleware/formidableParser.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
// /api/crop-ai/analyze-crop
router.post("/analyze-crop", authMiddleware, parseMultipart, analyzeCrop);

export default router;


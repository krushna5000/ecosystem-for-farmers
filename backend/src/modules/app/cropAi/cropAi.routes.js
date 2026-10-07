import { Router } from "express";
import analyzeCrop from "./cropAi.controller.js";
import authMiddleware from "../../../middleware/app/authMiddleware.js";
import { parseMultipart } from "../../../middleware/app/formidableParser.js";

// Mounted at /crop-ai
const router = Router();

router.post("/analyze-crop", authMiddleware, parseMultipart, analyzeCrop);

export default router;

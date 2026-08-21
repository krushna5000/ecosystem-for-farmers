import express from "express";
import analyzeWhatsappCrop from "../../controllers/whatsapp/cropController.js";
import { parseMultipart } from "../../middleware/formidableParser.js";

const router = express.Router();

router.post("/analyze-crop", parseMultipart, analyzeWhatsappCrop);

export default router;


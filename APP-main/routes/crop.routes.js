import express from "express";
import analyzeCrop from "../controllers/cropController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/analyze-crop", upload.single("image"), analyzeCrop);

export default router;

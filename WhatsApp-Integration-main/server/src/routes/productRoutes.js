import express from "express";
import { getRecommendations } from "../controllers/productController.js";

const router = express.Router();

/**
 * @route GET /api/products/recommendation
 * @desc Get product recommendations based on crop, disease or chemical
 * @access Public
 */
router.get("/recommendation", getRecommendations);

export default router;

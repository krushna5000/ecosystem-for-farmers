import { Router } from "express";
import { verifyCompanyToken } from "../middleware/authMiddleware.js";
import { getAllCrops } from "../controllers/cropController.js";

const router = Router();

// Company authentication
router.use(verifyCompanyToken);
router.get("/", getAllCrops);

export default router;

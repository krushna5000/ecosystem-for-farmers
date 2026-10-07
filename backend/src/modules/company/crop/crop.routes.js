import { Router } from "express";
import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";
import { getAllCrops } from "./crop.controller.js";

const router = Router();

// Company authentication
router.use(verifyCompanyToken);
router.get("/", getAllCrops);

export default router;

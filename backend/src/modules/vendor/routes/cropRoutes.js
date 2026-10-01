import { Router } from "express";
import { authenticateVendor } from "../middleware/authenticateVendor.js";
import { getAllCrops } from "../controllers/cropController.js";

const router = Router();

router.use(authenticateVendor);
router.get("/", getAllCrops);

export default router;

import { Router } from "express";
import { authenticateVendor } from "../../../middleware/vendor/authenticateVendor.js";
import { getAllCrops } from "./crop.controller.js";

const router = Router();

router.use(authenticateVendor);
router.get("/", getAllCrops);

export default router;

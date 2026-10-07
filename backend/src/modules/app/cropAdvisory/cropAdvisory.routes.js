import { Router } from "express";
import cropAdvisory from "./cropAdvisory.controller.js";

// Mounted at /crop-advisory
const router = Router();

router.get("/", cropAdvisory);

export default router;

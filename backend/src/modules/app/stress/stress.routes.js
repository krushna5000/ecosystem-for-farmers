import { Router } from "express";
import { calculateStress } from "./stress.controller.js";

// Mounted at /stress (old un-prefixed `app.use("/api", ...)`)
const router = Router();

router.get("/:fieldId/:date", calculateStress);

export default router;

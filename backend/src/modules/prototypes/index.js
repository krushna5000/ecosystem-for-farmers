import { Router } from "express";
import gddRoutes from "./gdd/gdd.routes.js";
import mapRoutes from "./map/map.routes.js";

// Prototype apps from FarmsEasy-AI-main (GDD calculator, farm-boundary map).
//   /api/prototypes/gdd/transform   (old: POST /api/transform on the GDD proxy)
//   /api/prototypes/map/farm        (old: POST /api/farm on the Map prototype)
const router = Router();
router.use("/gdd", gddRoutes);
router.use("/map", mapRoutes);

export default router;

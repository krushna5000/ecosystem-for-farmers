import { Router } from "express";
import coreRoutes from "./routes/core.routes.js";
import aiRoutes from "./routes/ai.routes.js";

export { initAppModule } from "./init.js";

// Farmer app + web app. core.routes = auth/farms/whatsapp (PostgreSQL),
// ai.routes = crop-ai, CLSM, weather, indexes, stress, advisory (Mongo + services).
const router = Router();
router.use(coreRoutes);
router.use(aiRoutes);

export default router;

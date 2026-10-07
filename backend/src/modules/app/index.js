import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import farmRoutes from "./farm/farm.routes.js";
import whatsappRoutes from "./whatsapp/whatsapp.routes.js";
import weatherRoutes from "./weather/weather.routes.js";
import cropAiRoutes from "./cropAi/cropAi.routes.js";
import agronomyRoutes from "./agronomy/agronomy.routes.js";
import cropAdvisoryRoutes from "./cropAdvisory/cropAdvisory.routes.js";
import indexesRoutes from "./indexes/indexes.routes.js";
import stressRoutes from "./stress/stress.routes.js";

// Farmer app + web app — mounted by routes/index.js at /api/app.
// Postgres-backed: auth, farms, whatsapp.  Mongo/AI-backed: weather, crop-ai, CLSM, advisory, indexes, stress.
const router = Router();

router.use("/auth", authRoutes);
router.use("/farms", farmRoutes);
router.use(whatsappRoutes); // /whatsapp-auth, /whatsapp-farm, /whatsapp
router.use("/weather", weatherRoutes);
router.use("/crop-ai", cropAiRoutes);
router.use("/CLSM", agronomyRoutes);
router.use("/crop-advisory", cropAdvisoryRoutes);
router.use("/indexes", indexesRoutes);
router.use("/stress", stressRoutes);

export default router;

import { Router } from "express";
import authRoutes from "../modules/app/auth/auth.routes.js";
import farmRoutes from "../modules/app/farm/farm.routes.js";
import whatsappRoutes from "../modules/app/whatsapp/whatsapp.routes.js";
import weatherRoutes from "../modules/app/weather/weather.routes.js";
import cropAiRoutes from "../modules/app/cropAi/cropAi.routes.js";
import agronomyRoutes from "../modules/app/agronomy/agronomy.routes.js";
import cropAdvisoryRoutes from "../modules/app/cropAdvisory/cropAdvisory.routes.js";
import indexesRoutes from "../modules/app/indexes/indexes.routes.js";
import stressRoutes from "../modules/app/stress/stress.routes.js";

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

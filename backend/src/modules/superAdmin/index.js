import { Router } from "express";
import cropCategoriesRoutes from "./routes/cropCategoriesRoutes.js";
import cropStagesRoutes from "./routes/cropStagesRoutes.js";
import cropsRoutes from "./routes/cropsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

// Mounted by app.js at /api/super-admin. Paths are the old server's mounts minus the leading "/api".
const router = Router();

router.use("/crop-categories", cropCategoriesRoutes);
router.use("/crop-stages", cropStagesRoutes);
router.use("/crops", cropsRoutes);
router.use("/", adminRoutes); //   /superadmin/login, /admin, /bulk-delete, ...
router.use("/location", locationRoutes);

export default router;

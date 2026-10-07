import { Router } from "express";
import cropCategoriesRoutes from "./cropCategories/cropCategories.routes.js";
import cropStagesRoutes from "./cropStages/cropStages.routes.js";
import cropsRoutes from "./crops/crops.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import locationRoutes from "./location/location.routes.js";

// Mounted by app.js at /api/super-admin. Paths are the old server's mounts minus the leading "/api".
const router = Router();

router.use("/crop-categories", cropCategoriesRoutes);
router.use("/crop-stages", cropStagesRoutes);
router.use("/crops", cropsRoutes);
router.use("/", adminRoutes); //   /superadmin/login, /admin, /bulk-delete, ...
router.use("/location", locationRoutes);

export default router;

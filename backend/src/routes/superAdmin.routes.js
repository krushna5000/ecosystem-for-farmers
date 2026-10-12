import { Router } from "express";
import cropCategoriesRoutes from "../modules/superAdminCropCategory/superAdminCropCategory.routes.js";
import cropStagesRoutes from "../modules/superAdminCropStage/superAdminCropStage.routes.js";
import cropsRoutes from "../modules/superAdminCrop/superAdminCrop.routes.js";
import adminRoutes from "../modules/superAdminAdmin/superAdminAdmin.routes.js";
import locationRoutes from "../modules/superAdminLocation/superAdminLocation.routes.js";

// Mounted by app.js at /api/super-admin. Paths are the old server's mounts minus the leading "/api".
const router = Router();

router.use("/crop-categories", cropCategoriesRoutes);
router.use("/crop-stages", cropStagesRoutes);
router.use("/crops", cropsRoutes);
router.use("/", adminRoutes); //   /superadmin/login, /admin, /bulk-delete, ...
router.use("/location", locationRoutes);

export default router;

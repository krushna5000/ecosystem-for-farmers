import { Router } from "express";
import adminRoutes from "./admin/admin.routes.js";
import jobRoutes from "./job/job.routes.js";
import connectionRoutes from "./connection/connection.routes.js";
import blogRoutes from "./blog/blog.routes.js";
import teamRoutes from "./team/team.routes.js";

// farmseasy.in marketing website CMS (mounted at /api/website by app.js)
const router = Router();

router.use("/", jobRoutes);
router.use("/", adminRoutes);
router.use("/", connectionRoutes);
router.use("/blogs", blogRoutes);
router.use("/team", teamRoutes);

export default router;

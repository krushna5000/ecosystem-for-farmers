import { Router } from "express";
import adminRoutes from "./routes/admin.routes.js";
import jobRoutes from "./routes/job.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import teamRoutes from "./routes/team.routes.js";

// farmseasy.in marketing website CMS (mounted at /api/website by app.js)
const router = Router();

router.use("/", jobRoutes);
router.use("/", adminRoutes);
router.use("/", connectionRoutes);
router.use("/blogs", blogRoutes);
router.use("/team", teamRoutes);

export default router;

import { Router } from "express";
import adminRoutes from "../modules/websiteAdmin/websiteAdmin.routes.js";
import jobRoutes from "../modules/websiteJob/websiteJob.routes.js";
import connectionRoutes from "../modules/websiteConnection/websiteConnection.routes.js";
import blogRoutes from "../modules/websiteBlog/websiteBlog.routes.js";
import teamRoutes from "../modules/websiteTeam/websiteTeam.routes.js";

// farmseasy.in marketing website CMS (mounted at /api/website by app.js)
const router = Router();

router.use("/", jobRoutes);
router.use("/", adminRoutes);
router.use("/", connectionRoutes);
router.use("/blogs", blogRoutes);
router.use("/team", teamRoutes);

export default router;

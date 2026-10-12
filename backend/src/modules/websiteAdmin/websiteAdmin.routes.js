import { Router } from "express";
import { authenticateWebsiteAdmin } from "../../middleware/websiteAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import * as websiteAdminController from "./websiteAdmin.controller.js";

// Mounted at the root of /api/website (routes/website.routes.js). Only the session check is protected.
const router = Router();

router.use(responseStyle("flag"));

router.post("/login", websiteAdminController.loginAdmin);
router.post("/logout", websiteAdminController.adminLogout);
router.post("/registeradmin", websiteAdminController.registerAdmin);
router.get("/login", authenticateWebsiteAdmin, websiteAdminController.checkAuth);

export default router;

import { Router } from "express";

import appRouter from "./app.routes.js";
import adminRouter from "./admin.routes.js";
import superAdminRouter from "./superAdmin.routes.js";
import companyRouter from "./company.routes.js";
import vendorRouter from "./vendor.routes.js";
import websiteRouter from "./website.routes.js";
import prototypesRouter from "./prototypes.routes.js";

// One router per portal. Inside each, the original route paths are preserved
// (minus the old leading "/api"), so a frontend only needs a new base URL.
const router = Router();

router.use("/app", appRouter); //                farmer app + web app (+ WhatsApp)
router.use("/admin", adminRouter); //            admin portal
router.use("/super-admin", superAdminRouter); //  super admin portal
router.use("/company-portal", companyRouter); // company portal
router.use("/vendor-portal", vendorRouter); //   vendor portal
router.use("/website", websiteRouter); //        farmseasy.in marketing site CMS
router.use("/prototypes", prototypesRouter); //  GDD + map prototypes (FarmsEasy-AI)

export default router;

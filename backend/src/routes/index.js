import { Router } from "express";

import appRouter from "../modules/app/index.js";
import adminRouter from "../modules/admin/index.js";
import superAdminRouter from "../modules/superAdmin/index.js";
import companyRouter from "../modules/company/index.js";
import vendorRouter from "../modules/vendor/index.js";
import websiteRouter from "../modules/website/index.js";
import prototypesRouter from "../modules/prototypes/index.js";

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

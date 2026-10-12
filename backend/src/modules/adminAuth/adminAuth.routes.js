import { Router } from "express";
import { adminAuth } from "../../middleware/adminAuth.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate } from "../../middleware/validate.js";
import { loginSchema } from "./adminAuth.validator.js";
import * as adminAuthController from "./adminAuth.controller.js";

// Mounted at the root of /api/admin (routes/admin.routes.js)
const router = Router();

router.use(responseStyle("flag"));

// Admin Login (public)
router.post("/login", validate(loginSchema), adminAuthController.adminLogin);

// Protected
router.post("/logout", adminAuth, adminAuthController.adminLogout);
// The admin frontend calls POST <base>/admin/logout, which the old backend never served.
router.post("/admin/logout", adminAuth, adminAuthController.adminLogout);

router.get("/dashboard", adminAuth, adminAuthController.getDashboard);

router.get("/check-auth", adminAuth, adminAuthController.checkAuth);

export default router;

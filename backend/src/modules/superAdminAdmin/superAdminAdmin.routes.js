import { Router } from "express";
import { authMiddleware } from "../../middleware/superAdminAuth.js";
import { loginLimiter } from "../../middleware/superAdminRateLimit.js";
import { responseStyle } from "../../middleware/responseStyle.js";
import { validate, validateParams } from "../../middleware/validate.js";
import {
  idParamSchema,
  loginSchema,
  createAdminSchema,
  updateAdminSchema,
  updatePasswordSchema,
  bulkDeleteSchema,
} from "./superAdminAdmin.validator.js";
import * as superAdminAdminController from "./superAdminAdmin.controller.js";

// Mounted at the router root "/api/super-admin" (routes/superAdmin.routes.js), AFTER the other prefixes.
// Auth is applied per route: the login route is public and this router sits at "/".
const router = Router();

router.use(responseStyle("flag"));

router.post("/superadmin/login", loginLimiter, validate(loginSchema), superAdminAdminController.superAdminLogin);
router.post("/superadmin/logout", authMiddleware, superAdminAdminController.superAdminLogout);
router.post("/admin", authMiddleware, validate(createAdminSchema), superAdminAdminController.createAdmin);
router.get("/admin", authMiddleware, superAdminAdminController.getAdmins);
router.put(
  "/admin/:id",
  authMiddleware,
  validateParams(idParamSchema),
  validate(updateAdminSchema),
  superAdminAdminController.updateAdmin,
);
router.delete("/admin/:id", authMiddleware, validateParams(idParamSchema), superAdminAdminController.deleteAdmin);
router.delete("/bulk-delete", authMiddleware, validate(bulkDeleteSchema), superAdminAdminController.bulkDeleteAdmins);
router.put(
  "/admin/password/:id",
  authMiddleware,
  validateParams(idParamSchema),
  validate(updatePasswordSchema),
  superAdminAdminController.updatePassword,
);
router.get("/superadmin/check-auth", authMiddleware, superAdminAdminController.checkAuth);

export default router;

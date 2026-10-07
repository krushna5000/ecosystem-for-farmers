import express from "express";
import {
  superAdminLogin,
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  superAdminLogout,
  bulkDeleteAdmins,
  updatePassword,
  checkAuth,
} from "./admin.controller.js";
import { loginLimiter } from "../../../middleware/superAdmin/rateLimit.js";
import { authMiddleware } from "../../../middleware/superAdmin/auth.js";

const router = express.Router();

router.post("/superadmin/login", loginLimiter, superAdminLogin);
router.post("/superadmin/logout", authMiddleware, superAdminLogout);
router.post("/admin", authMiddleware, createAdmin);
router.get("/admin", authMiddleware, getAdmins);
router.put("/admin/:id", authMiddleware, updateAdmin);
router.delete("/admin/:id", authMiddleware, deleteAdmin);
router.delete("/bulk-delete", authMiddleware, bulkDeleteAdmins);
router.put("/admin/password/:id", authMiddleware, updatePassword);
router.get("/superadmin/check-auth", authMiddleware, checkAuth);

export default router;

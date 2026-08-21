import express from "express";
import {
  superAdminLogin,
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  superAdminLogout,
  bulkDeleteAdmins,
  updatePassword
} from "../controllers/adminController.js";

import { loginLimiter, createAdminLimiter } from "../middlewares/rateLimit.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/superadmin/login", loginLimiter, superAdminLogin);
router.post("/superadmin/logout", authMiddleware, superAdminLogout);
router.post("/admin", authMiddleware, createAdmin);
router.get("/admin", authMiddleware, getAdmins);
router.put("/admin/:id", authMiddleware, updateAdmin);
router.delete("/admin/:id", authMiddleware, deleteAdmin);
router.delete("/bulk-delete", authMiddleware, bulkDeleteAdmins);
router.put("/admin/password/:id", authMiddleware, updatePassword);

router.get("/superadmin/check-auth", authMiddleware, (req, res) => {
  // if authmiddleware passes, superadmin is authenticated
  res.json({ authenticated: true, user: req.user || null });
});

export default router;

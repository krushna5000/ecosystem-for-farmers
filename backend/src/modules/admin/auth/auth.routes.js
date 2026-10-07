import express from "express";
import { adminLogin, adminLogout } from "./auth.controller.js";
import { adminAuth } from "../../../middleware/admin/adminAuth.js";

const router = express.Router();

// Admin Login (public)
router.post("/login", adminLogin);

// Protected
router.post("/logout", adminAuth, adminLogout);
// The admin frontend calls POST <base>/admin/logout, which the old backend never served.
router.post("/admin/logout", adminAuth, adminLogout);

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({
    success: true,
    message: "Admin Dashboard",
    admin: req.admin,
  });
});

router.get("/check-auth", adminAuth, (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

export default router;

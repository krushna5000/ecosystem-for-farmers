import express from "express";
import { adminLogin, adminLogout } from "../controllers/adminAuthController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/* ===============================
   PUBLIC ROUTE
================================ */

// Admin Login
router.post("/login", adminLogin);

/* ===============================
   PROTECTED ROUTES
================================ */

// Admin Logout
router.post("/logout", adminAuth, adminLogout);

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

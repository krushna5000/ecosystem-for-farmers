import express from "express";
//import { createAdmin } from "../controllers/adminController.js";
import { adminLogin } from "../controllers/adminAuthController.js";
import { adminAuth } from "../middleware/adminAuth.js";


const router = express.Router();

//router.post("/superadmin/create-admin", createAdmin);
router.post("/admin/login", adminLogin);
router.get("/admin/dashboard", adminAuth, (req, res) => {
  res.json({ message: "Admin Dashboard", admin: req.admin });
});

export default router;

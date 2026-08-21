import express from "express";
import {
  loginAdmin,
  registerAdmin,
  adminLogout,
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/logout", adminLogout);
router.post("/registeradmin", registerAdmin);
router.get("/login", authMiddleware, (req, res) => {
  res.json({ authenticated: true, user: req.user || null });
});

export { router as AdminRoute };

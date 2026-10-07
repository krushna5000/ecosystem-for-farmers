import { Router } from "express";
import {
  loginAdmin,
  registerAdmin,
  adminLogout,
  checkAuth,
} from "./admin.controller.js";
import { authMiddleware } from "../../../middleware/website/auth.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", adminLogout);
router.post("/registeradmin", registerAdmin);
router.get("/login", authMiddleware, checkAuth);

export default router;

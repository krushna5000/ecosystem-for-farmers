import express from "express";
import brandRoutes from "./brandRoutes.js";
import {
  companyLogin,
  companyLogout,
  updatePassword,
  getCompanyProfile,
} from "../controllers/companyController.js";
import { verifyCompanyToken } from "../middleware/authMiddleware.js";
import {
  loginRateLimiter,
  updatePasswordRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/login", loginRateLimiter, companyLogin);
router.put("/update-password", verifyCompanyToken, updatePasswordRateLimiter, updatePassword);
router.get("/profile", verifyCompanyToken, getCompanyProfile);
router.use("/brands", brandRoutes);
router.post("/logout", companyLogout);

export default router;

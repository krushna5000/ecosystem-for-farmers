import express from "express";
import brandRoutes from "../brand/brand.routes.js";
import {
  companyLogin,
  companyLogout,
  updatePassword,
  getCompanyProfile,
} from "./company.controller.js";
import { verifyCompanyToken } from "../../../middleware/company/authMiddleware.js";
import {
  loginRateLimiter,
  updatePasswordRateLimiter,
} from "../../../middleware/company/rateLimiter.js";

const router = express.Router();

router.post("/login", loginRateLimiter, companyLogin);
router.put("/update-password", verifyCompanyToken, updatePasswordRateLimiter, updatePassword);
router.get("/profile", verifyCompanyToken, getCompanyProfile);
router.use("/brands", brandRoutes);
router.post("/logout", companyLogout);

export default router;

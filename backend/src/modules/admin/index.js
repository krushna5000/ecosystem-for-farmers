import { Router } from "express";
import adminRoutes from "./auth/auth.routes.js";
import companyRoutes from "./company/company.routes.js";
import companyOtpRoutes from "./companyOtp/companyOtp.routes.js";
import companyTypeRoutes from "./companyType/companyType.routes.js";
import vendorRoutes from "./vendor/vendor.routes.js";
import vendorOtpRoutes from "./vendorOtp/vendorOtp.routes.js";

// Admin portal — mounted by app.js at /api/admin
const router = Router();

router.use("/", adminRoutes);
router.use("/companies", companyRoutes);
router.use("/company-otp", companyOtpRoutes);
router.use("/company-types", companyTypeRoutes);
router.use("/vendors", vendorRoutes);
router.use("/vendor-otp", vendorOtpRoutes);

export default router;

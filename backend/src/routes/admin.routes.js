import { Router } from "express";
import adminAuthRoutes from "../modules/adminAuth/adminAuth.routes.js";
import adminCompanyRoutes from "../modules/adminCompany/adminCompany.routes.js";
import adminCompanyOtpRoutes from "../modules/adminCompanyOtp/adminCompanyOtp.routes.js";
import adminCompanyTypeRoutes from "../modules/adminCompanyType/adminCompanyType.routes.js";
import adminVendorRoutes from "../modules/adminVendor/adminVendor.routes.js";
import adminVendorOtpRoutes from "../modules/adminVendorOtp/adminVendorOtp.routes.js";

// Admin portal — mounted by app.js at /api/admin
const router = Router();

router.use("/", adminAuthRoutes);
router.use("/companies", adminCompanyRoutes);
router.use("/company-otp", adminCompanyOtpRoutes);
router.use("/company-types", adminCompanyTypeRoutes);
router.use("/vendors", adminVendorRoutes);
router.use("/vendor-otp", adminVendorOtpRoutes);

export default router;

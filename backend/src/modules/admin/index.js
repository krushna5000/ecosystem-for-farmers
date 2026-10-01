import { Router } from "express";
import adminRoutes from "./routes/adminRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import companyOtpRoutes from "./routes/companyOtpRoutes.js";
import companyTypeRoutes from "./routes/companyTypeRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import vendorOtpRoutes from "./routes/vendorOtpRoutes.js";

// Admin portal — mounted by app.js at /api/admin
const router = Router();

router.use("/", adminRoutes);
router.use("/companies", companyRoutes);
router.use("/company-otp", companyOtpRoutes);
router.use("/company-types", companyTypeRoutes);
router.use("/vendors", vendorRoutes);
router.use("/vendor-otp", vendorOtpRoutes);

export default router;

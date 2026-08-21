// Note: This is a complete replacement. Backup original first if needed.
// Assuming standard server.js structure

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
import adminRoutes from "./routes/adminRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import companyOtpRoutes from "./routes/companyOtpRoutes.js";
import companyTypeRoutes from "./routes/companyTypeRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import vendorOtpRoutes from "./routes/vendorOtpRoutes.js";


app.use("/api", adminRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/company-otp", companyOtpRoutes);
app.use("/api/company-types", companyTypeRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor-otp", vendorOtpRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;


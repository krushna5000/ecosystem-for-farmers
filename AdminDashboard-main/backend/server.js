import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";

import adminRoutes from './routes/adminRoutes.js';
import companyRoutes from "./routes/companyRoutes.js";
import companyOtpRoutes from "./routes/companyOtpRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import vendorOtpRoutes from "./routes/vendorOtpRoutes.js";
import companyTypeRoutes from "./routes/companyTypeRoutes.js"

dotenv.config();
const app = express();
app.use(cookieParser());

app.use(cors(({
  origin: "http://localhost:5173",   // your React URL
  credentials: true
})));
app.use(express.json());

// STATIC FOLDER FOR PDF PREVIEW
app.use("/uploads", express.static("uploads"));

// ROUTES
app.use('/api', adminRoutes);
app.use('/api', companyRoutes);
app.use('/api',companyTypeRoutes);
app.use('/api', companyOtpRoutes);
app.use('/api', vendorRoutes);
app.use('/api', vendorOtpRoutes);


// HEALTH CHECK
app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

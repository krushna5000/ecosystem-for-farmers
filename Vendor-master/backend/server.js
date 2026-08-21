import dotenv from "dotenv"
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import vendorAuthRoutes from "./routes/vendorAuthRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import cropRoutes from "./routes/cropRoutes.js"
import { router as serviceLocationRoutes } from "./routes/serviceLocationRoutes.js";

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // THIS FIXES IT
  })
);
app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://vendor.farmseasy.in",
      "https://vendor.farmseasy.in",
    ],
    credentials: true,
  }),);
app.use(express.json());
app.use(cookieParser());

// Note: Static file serving removed as files are now hosted on S3

// Vendor Auth API
app.use("/api/vendor", vendorAuthRoutes);

// Vendor Management APIs
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/service-locations", serviceLocationRoutes);
app.use("/api/crops",cropRoutes)

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port ",process.env.PORT);
});

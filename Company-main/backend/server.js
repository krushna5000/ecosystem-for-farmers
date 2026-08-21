

import dotenv from "dotenv"

import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import companyRoutes from "./routes/companyRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import cropRoutes from './routes/cropRoutes.js'
import leadRoutes from "./routes/leadRoutes.js";

dotenv.config()
  


const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
     origin: [
      "http://localhost:5173",
      "http://company.farmseasy.in",
      "https://company.farmseasy.in",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/company", companyRoutes);
app.use("/api/company/categories", categoryRoutes);
app.use("/api/company/subcategories", subCategoryRoutes);
app.use("/api/company/products", productRoutes);
app.use("/api/company/inventory", inventoryRoutes);
app.use("/api/crops",cropRoutes)
app.use("/api/company/leads", leadRoutes);

app.get('/', (req, res) => res.send('Company Server is running!'));

app.listen(process.env.PORT, () => console.log("Server running on ",process.env.PORT));

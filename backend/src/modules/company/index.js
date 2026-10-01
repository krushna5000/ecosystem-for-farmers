import { Router } from "express";
import companyRoutes from "./routes/companyRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import cropRoutes from "./routes/cropRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";

// Company portal — mounted at /api/company-portal (old paths minus the leading /api).
const router = Router();

router.use("/company", companyRoutes);
router.use("/company/categories", categoryRoutes);
router.use("/company/subcategories", subCategoryRoutes);
router.use("/company/products", productRoutes);
router.use("/company/inventory", inventoryRoutes);
router.use("/crops", cropRoutes);
router.use("/company/leads", leadRoutes);

export default router;

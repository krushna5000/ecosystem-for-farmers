import { Router } from "express";
import vendorAuthRoutes from "./routes/vendorAuthRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import serviceLocationRoutes from "./routes/serviceLocationRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";

// Mounted by app.js at /api/vendor-portal
const router = Router();

router.use("/vendor", vendorAuthRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subCategoryRoutes);
router.use("/products", productRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/service-locations", serviceLocationRoutes);
router.use("/crops", cropRoutes);

export default router;

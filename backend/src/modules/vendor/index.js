import { Router } from "express";
import vendorAuthRoutes from "./auth/auth.routes.js";
import brandRoutes from "./brand/brand.routes.js";
import categoryRoutes from "./category/category.routes.js";
import subCategoryRoutes from "./subCategory/subCategory.routes.js";
import productRoutes from "./product/product.routes.js";
import inventoryRoutes from "./inventory/inventory.routes.js";
import serviceLocationRoutes from "./serviceLocation/serviceLocation.routes.js";
import cropRoutes from "./crop/crop.routes.js";

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

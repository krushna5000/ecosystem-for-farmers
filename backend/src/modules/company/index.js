import { Router } from "express";
import companyRoutes from "./company/company.routes.js";
import categoryRoutes from "./category/category.routes.js";
import subCategoryRoutes from "./subCategory/subCategory.routes.js";
import productRoutes from "./product/product.routes.js";
import inventoryRoutes from "./inventory/inventory.routes.js";
import cropRoutes from "./crop/crop.routes.js";
import leadRoutes from "./lead/lead.routes.js";

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

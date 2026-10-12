import { Router } from "express";
import vendorAuthRoutes from "../modules/vendorAuth/vendorAuth.routes.js";
import brandRoutes from "../modules/vendorBrand/vendorBrand.routes.js";
import categoryRoutes from "../modules/vendorCategory/vendorCategory.routes.js";
import subCategoryRoutes from "../modules/vendorSubCategory/vendorSubCategory.routes.js";
import productRoutes from "../modules/vendorProduct/vendorProduct.routes.js";
import inventoryRoutes from "../modules/vendorInventory/vendorInventory.routes.js";
import serviceLocationRoutes from "../modules/vendorServiceLocation/vendorServiceLocation.routes.js";
import cropRoutes from "../modules/vendorCrop/vendorCrop.routes.js";

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

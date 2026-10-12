import { Router } from "express";
import companyAuthRoutes from "../modules/companyAuth/companyAuth.routes.js";
import companyBrandRoutes from "../modules/companyBrand/companyBrand.routes.js";
import companyCategoryRoutes from "../modules/companyCategory/companyCategory.routes.js";
import companySubCategoryRoutes from "../modules/companySubCategory/companySubCategory.routes.js";
import companyProductRoutes from "../modules/companyProduct/companyProduct.routes.js";
import companyInventoryRoutes from "../modules/companyInventory/companyInventory.routes.js";
import companyCropRoutes from "../modules/companyCrop/companyCrop.routes.js";
import companyLeadRoutes from "../modules/companyLead/companyLead.routes.js";

// Company portal — mounted at /api/company-portal (old paths minus the leading /api).
const router = Router();

router.use("/company", companyAuthRoutes);
router.use("/company/brands", companyBrandRoutes); // nested inside /company in the legacy router
router.use("/company/categories", companyCategoryRoutes);
router.use("/company/subcategories", companySubCategoryRoutes);
router.use("/company/products", companyProductRoutes);
router.use("/company/inventory", companyInventoryRoutes);
router.use("/crops", companyCropRoutes);
router.use("/company/leads", companyLeadRoutes);

export default router;

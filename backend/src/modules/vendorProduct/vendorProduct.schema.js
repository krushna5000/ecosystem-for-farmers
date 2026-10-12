// Drizzle tables used by vendor products — re-exported from the canonical db/schema.
// Brands, categories and sub-categories are read to check ownership and to join their names in.
export {
  vendorProducts,
  vendorBrands,
  vendorCategories,
  vendorSubCategories,
} from "../../db/schema/index.js";

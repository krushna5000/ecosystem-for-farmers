// Drizzle tables used by company products (company_schema.products + the brand / category /
// sub-category they reference), re-exported from the canonical db/schema.
export {
  companyProducts,
  companyBrands,
  companyCategories,
  companySubCategories,
} from "../../db/schema/index.js";

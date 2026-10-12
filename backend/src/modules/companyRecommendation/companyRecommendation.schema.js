// @module-kind service — no HTTP surface; consumed by companyProduct and appCropAi.
// Tables read by the product recommendation engine, re-exported from the canonical db/schema.
export {
  companyBrands,
  companyCategories,
  companySubCategories,
  companyProducts,
  crops,
} from "../../db/schema/index.js";

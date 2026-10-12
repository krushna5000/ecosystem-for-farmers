import { z } from "zod";
import {
  bulkDeleteSchema as bulkDelete,
  idParamSchema,
  pageQuerySchema,
} from "../../utils/companyValidation.js";

export const idParamsSchema = idParamSchema("Invalid product ID format");

export const listQuerySchema = pageQuerySchema;

// Product forms arrive as multipart (JSON-encoded strings) or JSON. The JSON parsing and the
// "required" check stay in the service: they run in a fixed order ("Invalid JSON format" wins over
// "... are required"), which a schema's per-field issues cannot express.
const productFields = {
  brand_id: z.any().optional(),
  category_id: z.any().optional(),
  sub_category_id: z.any().optional(),
  product_name: z.any().optional(),
  description: z.any().optional(),
  chemical_composition: z.any().optional(),
  crop_ids: z.any().optional(),
  disease_names: z.any().optional(),
};

export const createCompanyProductSchema = z.object(productFields).passthrough();

export const updateCompanyProductSchema = z.object(productFields).passthrough();

// "At least one of ..." is checked by the service: its 400 body is pinned and differs from the
// router's response style.
export const recommendationQuerySchema = z
  .object({
    cropName: z.any().optional(),
    diseaseName: z.any().optional(),
    chemicalComposition: z.any().optional(),
  })
  .passthrough();

export const bulkDeleteSchema = bulkDelete(
  "Array of product IDs is required",
  "Invalid product ID format",
);

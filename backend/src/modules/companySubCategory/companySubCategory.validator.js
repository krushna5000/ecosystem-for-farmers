import { z } from "zod";
import {
  bulkDeleteSchema as bulkDelete,
  idParamSchema,
  pageQuerySchema,
  truthy,
} from "../../utils/companyValidation.js";

// Messages are the legacy API texts — clients display them as-is.
const requiredMessage = "brand_id, category_id and sub_category_name are required";

export const idParamsSchema = idParamSchema("Invalid sub-category ID format");

export const listQuerySchema = pageQuerySchema;

export const createCompanySubCategorySchema = z
  .object({
    brand_id: truthy(requiredMessage),
    category_id: truthy(requiredMessage),
    sub_category_name: z
      .string({ required_error: requiredMessage, invalid_type_error: requiredMessage })
      .trim()
      .min(1, requiredMessage),
  })
  .passthrough();

// Every field is optional (only the provided ones change); `status` is normalised by the service.
export const updateCompanySubCategorySchema = z
  .object({
    brand_id: z.any().optional(),
    category_id: z.any().optional(),
    sub_category_name: z.any().optional(),
    status: z.any().optional(),
  })
  .passthrough();

export const bulkDeleteSchema = bulkDelete(
  "Array of sub-category IDs is required",
  "Invalid sub-category ID format",
);

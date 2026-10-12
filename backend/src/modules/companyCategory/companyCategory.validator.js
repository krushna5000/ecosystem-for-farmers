import { z } from "zod";
import {
  bulkDeleteSchema as bulkDelete,
  idParamSchema,
  pageQuerySchema,
  truthy,
} from "../../utils/companyValidation.js";

// Messages are the legacy API texts — clients display them as-is.
const requiredMessage = "brand_id and category_name are required";

export const idParamsSchema = idParamSchema("Invalid category ID format");

export const listQuerySchema = pageQuerySchema;

// Create trims the name; update has always used it untrimmed.
export const createCompanyCategorySchema = z
  .object({
    brand_id: truthy(requiredMessage),
    category_name: z
      .string({ required_error: requiredMessage, invalid_type_error: requiredMessage })
      .trim()
      .min(1, requiredMessage),
  })
  .passthrough();

export const updateCompanyCategorySchema = z
  .object({
    brand_id: truthy(requiredMessage),
    category_name: truthy(requiredMessage),
  })
  .passthrough();

export const bulkDeleteSchema = bulkDelete(
  "Array of category IDs is required",
  "Invalid category ID format",
);

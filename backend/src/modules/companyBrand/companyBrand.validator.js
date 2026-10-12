import { z } from "zod";
import {
  bulkDeleteSchema as bulkDelete,
  idParamSchema,
  pageQuerySchema,
} from "../../utils/companyValidation.js";

// Messages are the legacy API texts — clients display them as-is.
const nameMessage = "Brand name is required";

export const idParamsSchema = idParamSchema("Invalid brand ID format");

export const listQuerySchema = pageQuerySchema;

// multipart/form-data: every field arrives as a string. The logo itself is checked by the service
// (after the name, as before).
export const createCompanyBrandSchema = z
  .object({
    brand_name: z
      .string({ required_error: nameMessage, invalid_type_error: nameMessage })
      .trim()
      .min(1, nameMessage),
  })
  .passthrough();

// `status` is normalised by the service.
export const updateCompanyBrandSchema = z
  .object({
    brand_name: z.string().nullish(),
    status: z.any().optional(),
  })
  .passthrough();

export const bulkDeleteSchema = bulkDelete(
  "Array of brand IDs is required",
  "Invalid brand ID format",
);

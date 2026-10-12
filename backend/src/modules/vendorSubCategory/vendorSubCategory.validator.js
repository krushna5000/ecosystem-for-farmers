import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid sub-category ID format";

// The legacy handlers tested `!value`, so "required" means falsy (missing, null, "" ...), whatever the type.
const truthy = (message) => z.any().refine(Boolean, message);

// `parseInt(x) || fallback`, the pagination rule every list endpoint of this portal has always used.
const intOr = (fallback) => z.preprocess((v) => parseInt(v) || fallback, z.number().int());

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

export const listQuerySchema = z
  .object({
    page: intOr(1),
    limit: intOr(10),
  })
  .passthrough();

const requiredMessage = "brand_id, category_id and sub_category_name are required";

// Create trims the name before checking it, so a blank name counts as missing.
export const createVendorSubCategorySchema = z
  .object({
    brand_id: truthy(requiredMessage),
    category_id: truthy(requiredMessage),
    sub_category_name: z
      .string({ required_error: requiredMessage, invalid_type_error: requiredMessage })
      .trim()
      .min(1, requiredMessage),
  })
  .passthrough();

// Every field is optional on update; the service applies only the ones that were sent.
export const updateVendorSubCategorySchema = z
  .object({
    brand_id: z.any().optional(),
    category_id: z.any().optional(),
    sub_category_name: z.any().optional(),
    status: z.any().optional(),
  })
  .passthrough();

const idsMessage = "Please provide an array of sub-category IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

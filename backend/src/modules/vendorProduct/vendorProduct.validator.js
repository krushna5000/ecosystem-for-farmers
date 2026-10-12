import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idParam = (name, message) =>
  z.object({ [name]: z.coerce.number({ invalid_type_error: message }).int(message) });

export const idParamSchema = idParam("id", "Invalid product ID format");
export const brandIdParamSchema = idParam("brand_id", "Invalid brand ID format");
export const categoryIdParamSchema = idParam("category_id", "Invalid category ID format");
export const subCategoryIdParamSchema = idParam("sub_category_id", "Invalid sub-category ID format");

// `parseInt(x) || fallback`, the pagination rule every list endpoint of this portal has always used.
const intOr = (fallback) => z.preprocess((v) => parseInt(v) || fallback, z.number().int());

export const listQuerySchema = z
  .object({
    page: intOr(1),
    limit: intOr(10),
  })
  .passthrough();

// multipart fields arrive as JSON strings; JSON bodies may already be parsed
const parseJsonField = (value) => (typeof value === "string" ? JSON.parse(value) : value);

const parseCropIds = (value) => {
  const parsed = parseJsonField(value);
  return Array.isArray(parsed) ? parsed.map(Number) : [Number(parsed)];
};

// A JSON-encoded field that is only parsed when it was sent (falsy -> `fallback`); unparsable input becomes a
// zod issue carrying the legacy message. Zod reports issues in key order, so these come before the
// "required" check below — the same order the old handler parsed first and validated afterwards.
const jsonField = (parse, message, fallback) =>
  z.any().transform((value, ctx) => {
    if (!value) return fallback;
    try {
      return parse(value);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      return z.NEVER;
    }
  });

const createRequiredMessage =
  "brand_id, category_id, sub_category_id, product_name, crop_ids and chemical_composition are required";

// multipart/form-data: brand_id, category_id, sub_category_id, product_name, description arrive untouched
// (passthrough); chemical_composition / crop_ids are parsed here and default to [].
export const createVendorProductSchema = z
  .object({
    chemical_composition: jsonField(parseJsonField, "Invalid JSON format", []),
    crop_ids: jsonField(parseCropIds, "Invalid JSON format", []),
  })
  .passthrough()
  .refine(
    (body) =>
      body.brand_id &&
      body.category_id &&
      body.sub_category_id &&
      body.product_name &&
      body.chemical_composition?.length &&
      body.crop_ids?.length,
    { message: createRequiredMessage },
  );

// Update: both fields default to null ("leave unchanged"); everything else is optional and read by the service.
export const updateVendorProductSchema = z
  .object({
    chemical_composition: jsonField(parseJsonField, "chemical_composition must be valid JSON", null),
    crop_ids: jsonField(parseCropIds, "crop_ids must be valid JSON", null),
  })
  .passthrough();

const idsMessage = "Please provide an array of product IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

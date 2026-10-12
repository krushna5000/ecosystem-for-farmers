import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid brand ID format";

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

// multipart/form-data: every field arrives as a string; `status` is normalised by the service.
export const createVendorBrandSchema = z
  .object({
    brand_name: z
      .string({ required_error: "Brand name is required", invalid_type_error: "Brand name is required" })
      .trim()
      .min(1, "Brand name is required"),
    status: z.any().optional(),
  })
  .passthrough();

export const updateVendorBrandSchema = z
  .object({
    brand_name: z.string().optional(),
    status: z.any().optional(),
  })
  .passthrough();

const idsMessage = "Please provide an array of brand IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

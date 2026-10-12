// Zod fragments shared by the company-portal validators. Messages are the legacy API texts —
// clients display them as-is.
import { z } from "zod";

// `parseInt(x) || fallback`, the pagination rule every list endpoint of this portal has always used.
const intOr = (fallback) => z.preprocess((v) => parseInt(v) || fallback, z.number().int());

export const pageQuerySchema = z
  .object({
    page: intOr(1),
    limit: intOr(10),
  })
  .passthrough();

/** `:id` must be numeric, e.g. idParamSchema("Invalid brand ID format"). */
export const idParamSchema = (message) =>
  z.object({
    id: z.coerce.number({ invalid_type_error: message }).int(message),
  });

/** Body of a bulk-delete: a non-empty array whose entries are all numeric. */
export const bulkDeleteSchema = (requiredMessage, invalidMessage) =>
  z
    .object({
      ids: z
        .array(z.any(), { required_error: requiredMessage, invalid_type_error: requiredMessage })
        .min(1, requiredMessage)
        .refine((ids) => !ids.some((id) => isNaN(id)), invalidMessage),
    })
    .passthrough();

/** A field that legacy handlers only tested for truthiness. */
export const truthy = (message) => z.any().refine((value) => Boolean(value), message);

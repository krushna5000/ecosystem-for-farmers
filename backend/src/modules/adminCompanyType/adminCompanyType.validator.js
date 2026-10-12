import { z } from "zod";
import { parsePagination } from "../../utils/adminHelpers.js";

const idMessage = "Invalid company type ID";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

// Legacy `?page&limit` rule: both optional, `parseInt(x) || default`; pagination is only applied when one was sent.
export const listQuerySchema = z.object({}).passthrough().transform(parsePagination);

// The legacy endpoints never validated the body: a missing `type` is a NOT NULL violation answered with the driver's
// message (500), so the schema stays lenient and only guarantees an object.
export const createCompanyTypeSchema = z
  .object({
    type: z.any().optional(),
    description: z.any().optional(),
  })
  .passthrough();

export const updateCompanyTypeSchema = createCompanyTypeSchema;

import { z } from "zod";
import { paginationQuerySchema } from "../../utils/superAdminPagination.js";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid category ID";

// The legacy handlers used `parseInt(id, 10)` + isNaN, so "12abc" has always been accepted as 12.
export const idParamSchema = z.object({
  id: z.preprocess(
    (v) => parseInt(v, 10),
    z.number({ invalid_type_error: idMessage, required_error: idMessage }).int(idMessage),
  ),
});

export const listQuerySchema = paginationQuerySchema;

// Legacy check was plain truthiness (`!category_name`).
const nameRequired = z.any().refine((value) => Boolean(value), "Category name is required");

export const createCategorySchema = z
  .object({
    category_name: nameRequired,
    description: z.any().optional(),
  })
  .passthrough();

export const updateCategorySchema = createCategorySchema;

const idsMessage = "Invalid category IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

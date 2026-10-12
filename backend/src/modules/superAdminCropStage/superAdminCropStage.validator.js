import { z } from "zod";
import { paginationQuerySchema } from "../../utils/superAdminPagination.js";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid stage ID";

// get / update used `parseInt(id, 10)` + isNaN, so "12abc" has always been accepted as 12.
export const idParamSchema = z.object({
  id: z.preprocess(
    (v) => parseInt(v, 10),
    z.number({ invalid_type_error: idMessage, required_error: idMessage }).int(idMessage),
  ),
});

// delete used `Number(id)` + Number.isInteger, which is stricter ("12abc" is rejected).
export const strictIdParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

export const listQuerySchema = paginationQuerySchema;

// Legacy check was plain truthiness (`!stage_name`).
const nameRequired = z.any().refine((value) => Boolean(value), "Stage name is required");

export const createCropStageSchema = z
  .object({
    stage_name: nameRequired,
    description: z.any().optional(),
  })
  .passthrough();

export const updateCropStageSchema = createCropStageSchema;

const idsMessage = "Invalid stage IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

import { z } from "zod";
import { paginationQuerySchema } from "../../utils/superAdminPagination.js";

// Messages are the legacy API texts — clients display them as-is.
// The add-crop checks ("Required fields are missing" / "Invalid crop_stages_id") answer an extra `error`
// key in the legacy body, which a validator cannot carry, so they live in the service.
const idMessage = "Invalid crop id";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

export const listQuerySchema = paginationQuerySchema;

const idsMessage = "Invalid crop IDs";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

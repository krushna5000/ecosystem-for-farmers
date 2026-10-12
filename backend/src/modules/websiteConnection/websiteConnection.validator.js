import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idsMessage = "No Connection IDs provided";

export const bulkDeleteSchema = z
  .object(
    {
      ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
    },
    { required_error: idsMessage, invalid_type_error: idsMessage },
  )
  .passthrough();

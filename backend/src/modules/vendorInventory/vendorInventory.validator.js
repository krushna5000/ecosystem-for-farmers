import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid inventory ID format";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

// The legacy handlers tested `!product_id` and `quantity == null` (so a quantity of 0 is fine), in that order;
// zod reports issues in key order, so product_id is checked first here too.
export const createVendorInventorySchema = z
  .object({
    product_id: z.any().refine(Boolean, "product_id is required"),
    quantity: z.any().refine((v) => v != null, "quantity is required"),
  })
  .passthrough();

export const updateVendorInventorySchema = z
  .object({
    quantity: z.any().refine((v) => v != null, "quantity is required"),
  })
  .passthrough();

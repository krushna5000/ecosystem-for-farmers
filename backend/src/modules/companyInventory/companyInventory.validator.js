import { z } from "zod";
import {
  bulkDeleteSchema as bulkDelete,
  idParamSchema,
  pageQuerySchema,
  truthy,
} from "../../utils/companyValidation.js";

// Messages are the legacy API texts — clients display them as-is.
const quantityMessage = "quantity is required";

// `quantity: 0` is a valid stock level, so only null / undefined count as missing.
const quantity = z.any().refine((value) => value != null, quantityMessage);

export const idParamsSchema = idParamSchema("Invalid inventory ID format");

export const listQuerySchema = pageQuerySchema;

export const createCompanyInventorySchema = z
  .object({
    product_id: truthy("product_id is required"),
    quantity,
  })
  .passthrough();

export const updateCompanyInventorySchema = z.object({ quantity }).passthrough();

export const bulkDeleteSchema = bulkDelete(
  "Array of inventory IDs is required",
  "Invalid inventory ID format",
);

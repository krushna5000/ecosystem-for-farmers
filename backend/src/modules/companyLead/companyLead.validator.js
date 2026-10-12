import { z } from "zod";
import { idParamSchema } from "../../utils/companyValidation.js";

export const LEAD_STATUSES = ["new", "contacted", "converted"];

export const idParamsSchema = idParamSchema("Invalid lead ID format");

export const updateLeadStatusSchema = z
  .object({
    status: z.any().refine((status) => LEAD_STATUSES.includes(status), "Invalid status"),
  })
  .passthrough();

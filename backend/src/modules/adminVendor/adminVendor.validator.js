import { z } from "zod";
import { parsePagination } from "../../utils/adminHelpers.js";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid vendor ID";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

// Legacy `?page&limit` rule: both optional, `parseInt(x) || default`; pagination is only applied when one was sent.
export const listQuerySchema = z.object({}).passthrough().transform(parsePagination);

// The legacy check was `!value` (blank, 0 and absent all count as missing), so mirror it with a truthiness refine.
const required = (message) => z.any().refine(Boolean, message);

// multipart/form-data (the four PDF fields are handled by the upload middleware): every field arrives as a string.
const missingFields = "Name, email, and phone are required";
export const addVendorSchema = z
  .object({
    name: required(missingFields),
    email: required(missingFields),
    phone: required(missingFields),
    password: z.any().optional(),
    shop_act_no: z.any().optional(),
    gst_no: z.any().optional(),
    licence_no: z.any().optional(),
    pan_no: z.any().optional(),
  })
  .passthrough();

// Every field is optional: omitted / falsy values keep the stored value (old COALESCE behaviour), applied by the service.
export const updateVendorSchema = z
  .object({
    name: z.any().optional(),
    email: z.any().optional(),
    password: z.any().optional(),
    phone: z.any().optional(),
    shop_act_no: z.any().optional(),
    gst_no: z.any().optional(),
    licence_no: z.any().optional(),
    pan_no: z.any().optional(),
    is_active: z.any().optional(),
    is_approve: z.any().optional(),
  })
  .passthrough();

export const resetPasswordSchema = z
  .object({
    newPassword: required("New password required"),
  })
  .passthrough();

const idsMessage = "Please provide an array of vendor IDs to delete";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

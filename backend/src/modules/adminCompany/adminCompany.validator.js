import { z } from "zod";
import { parsePagination } from "../../utils/adminHelpers.js";

// Messages are the legacy API texts — clients display them as-is.
const idMessage = "Invalid company ID";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

// Legacy `?page&limit` rule: both optional, `parseInt(x) || default`; pagination is only applied when one was sent.
export const listQuerySchema = z.object({}).passthrough().transform(parsePagination);

// The legacy check was `!value` (blank, 0 and absent all count as missing), so mirror it with a truthiness refine.
const required = (message) => z.any().refine(Boolean, message);

// multipart/form-data (field `logo` is handled by the upload middleware): every field arrives as a string.
const missingFields = "Missing required fields";
export const addCompanySchema = z
  .object({
    company_type: required(missingFields),
    email: required(missingFields),
    name: required(missingFields),
    address: required(missingFields),
    gst_no: required(missingFields),
    phone: required(missingFields),
    llp_no: z.any().optional(),
    cin_no: z.any().optional(),
    password: z.any().optional(),
  })
  .passthrough();

// Every field is optional: blank / omitted values keep the stored value (old COALESCE behaviour), applied by the service.
export const updateCompanySchema = z
  .object({
    company_type: z.any().optional(),
    email: z.any().optional(),
    password: z.any().optional(),
    llp_no: z.any().optional(),
    cin_no: z.any().optional(),
    name: z.any().optional(),
    address: z.any().optional(),
    gst_no: z.any().optional(),
    phone: z.any().optional(),
    is_active: z.any().optional(),
    is_approved: z.any().optional(),
  })
  .passthrough();

export const resetPasswordSchema = z
  .object({
    newPassword: required("New password is required"),
  })
  .passthrough();

const idsMessage = "Please provide an array of company IDs to delete";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

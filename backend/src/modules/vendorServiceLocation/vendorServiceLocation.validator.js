import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const idParam = (name, message) =>
  z.object({ [name]: z.coerce.number({ invalid_type_error: message }).int(message) });

export const idParamSchema = idParam("id", "Invalid service location ID format");
export const vendorIdParamSchema = idParam("vendor_id", "Invalid vendor ID format");

// The legacy handler tested `!value` on each field, so "required" means falsy (missing, null, "" ...).
const requiredMessage = "Vendor ID, State, City, and Pincode are required";
const truthy = (message) => z.any().refine(Boolean, message);

export const createServiceLocationSchema = z
  .object({
    vendor_id: truthy(requiredMessage),
    state: truthy(requiredMessage),
    city: truthy(requiredMessage),
    pincode: truthy(requiredMessage),
  })
  .passthrough();

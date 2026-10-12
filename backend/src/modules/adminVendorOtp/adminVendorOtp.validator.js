import { z } from "zod";

// The OTP endpoints answer their "required" failures with `{ message }` (no `success` flag), which a zod
// failure cannot reproduce, so those checks live in the service. The schemas only guarantee an object body.
export const sendVendorOtpSchema = z
  .object({
    vendor_id: z.any().optional(),
    email: z.any().optional(),
  })
  .passthrough();

export const verifyVendorOtpSchema = z
  .object({
    vendor_id: z.any().optional(),
    otp: z.any().optional(),
  })
  .passthrough();

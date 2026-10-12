import { z } from "zod";

// The OTP endpoints answer their "required" failures with `{ message }` (no `success` flag), which a zod
// failure cannot reproduce, so those checks live in the service. The schemas only guarantee an object body.
export const sendCompanyOtpSchema = z
  .object({
    company_id: z.any().optional(),
    phone: z.any().optional(),
  })
  .passthrough();

export const verifyCompanyOtpSchema = z
  .object({
    company_id: z.any().optional(),
    otp_code: z.any().optional(),
  })
  .passthrough();

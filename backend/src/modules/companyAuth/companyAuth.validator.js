import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.

// Login has no field checks of its own: a missing email is "Company does not exist" and the
// credentials are compared by the service.
export const loginSchema = z
  .object({
    email: z.any().optional(),
    password: z.any().optional(),
  })
  .passthrough();

// "Empty body" is reported before "fields missing", as before.
export const updatePasswordSchema = z
  .object({
    oldPassword: z.any().optional(),
    newPassword: z.any().optional(),
  })
  .passthrough()
  .superRefine((body, ctx) => {
    if (Object.keys(body).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Request body cannot be empty" });
      return;
    }
    if (!body.oldPassword || !body.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "oldPassword and newPassword are required",
      });
    }
  });

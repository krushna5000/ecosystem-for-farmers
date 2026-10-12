import { z } from "zod";

/**
 * Body schema for the farmer-app endpoints whose legacy handlers checked their input one rule after another and
 * answered with the first failure. `check(body)` returns that first failure's message (or nothing when the body
 * is fine); validate() turns it into the 400 response. Unknown keys are kept (`.passthrough()`).
 */
export const checkedBody = (check) =>
  z
    .object({})
    .passthrough()
    .superRefine((body, ctx) => {
      const message = check(body);
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    });

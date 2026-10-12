import { z } from "zod";

// Login is deliberately lenient: a missing / odd email is answered "Admin not found" (404) and a missing password
// fails inside bcrypt, exactly as the legacy handler did — the schema only guarantees `req.body` is an object.
export const loginSchema = z
  .object({
    email: z.any().optional(),
    password: z.any().optional(),
  })
  .passthrough();

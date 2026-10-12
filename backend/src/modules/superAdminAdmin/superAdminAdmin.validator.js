import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
// Legacy checks were plain truthiness (`!name`), so a field "is missing" when it is absent, null, "" or 0.
const required = (message) => z.any().refine((value) => Boolean(value), message);

const idMessage = "Invalid admin id";

export const idParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: idMessage }).int(idMessage),
});

export const loginSchema = z
  .object({
    email: required("Email and password are required"),
    password: required("Email and password are required"),
  })
  .passthrough();

export const createAdminSchema = z
  .object({
    name: required("name, email and password are required"),
    email: required("name, email and password are required"),
    password: required("name, email and password are required"),
  })
  .passthrough();

export const updateAdminSchema = z
  .object({
    name: required("name & email are required"),
    email: required("name & email are required"),
  })
  .passthrough();

export const updatePasswordSchema = z
  .object({
    newPassword: required("New password is required"),
  })
  .passthrough();

const idsMessage = "Invalid admin ids";
export const bulkDeleteSchema = z
  .object({
    ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
  })
  .passthrough();

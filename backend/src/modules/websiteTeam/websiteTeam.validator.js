import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const requiredMessage = "Name and position are required";
const idsMessage = "No IDs provided";

// The legacy check was `!name || !position`: any falsy value (missing, "", 0, null) is rejected.
const required = z.any().refine(Boolean, requiredMessage);

// multipart/form-data: every field arrives as a string; the service normalises the rest.
export const createTeamMemberSchema = z
  .object(
    { name: required, position: required },
    { required_error: requiredMessage, invalid_type_error: requiredMessage },
  )
  .passthrough();

export const bulkDeleteSchema = z
  .object(
    {
      ids: z.array(z.any(), { required_error: idsMessage, invalid_type_error: idsMessage }).min(1, idsMessage),
    },
    { required_error: idsMessage, invalid_type_error: idsMessage },
  )
  .passthrough();

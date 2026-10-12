import { pageQuerySchema } from "../../utils/companyValidation.js";

// `?page=&limit=`, falling back to 1 / 10 exactly like every other company list.
export const listQuerySchema = pageQuerySchema;

import { AppError } from "../errors/index.js";

const INTERNAL_ERROR_BODY = { error: "Internal Server Error" };

/**
 * The website CMS never used one error envelope: an unexpected failure answered a bespoke 500 body per
 * endpoint (`{ error: "Internal Server Error" }`, `{ success: false }`, ...). Clients of farmseasy.in read
 * them, so the services run their DB/upload work through here: a deliberate AppError passes through
 * untouched, anything else is logged and re-thrown as a 500 that pins `body`.
 */
export async function withLegacy500(label, fn, body = INTERNAL_ERROR_BODY) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.error(label, err);
    throw new AppError("Internal Server Error", 500, { body });
  }
}

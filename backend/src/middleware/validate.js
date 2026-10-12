import { ValidationError } from "../errors/index.js";

// Zod request validation. On failure the message is the first issue's message, so a schema can
// carry the exact legacy text ("Brand name is required") and clients keep seeing it.
const fieldErrors = (err) =>
  err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));

const reject = (err) => new ValidationError(err.issues[0]?.message ?? "Validation failed", fieldErrors(err));

/** Validate req.body; the parsed value replaces it. Body schemas use `.passthrough()`. */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return next(reject(result.error));
    req.body = result.data;
    next();
  };
}

/** Validate req.query. In Express 5 `req.query` is a getter, so the parsed value is defined over it. */
export function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return next(reject(result.error));
    Object.defineProperty(req, "query", {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
}

/** Validate req.params. */
export function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) return next(reject(result.error));
    req.params = result.data;
    next();
  };
}

import { env } from "../config/env.js";
import { errorBody } from "../utils/response.js";

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Single place errors become HTTP responses. Services/middleware throw AppError subclasses (src/errors);
// anything else (driver errors, multer, body-parser) is mapped from its own status.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.statusCode || err.status || (err.name === "MulterError" ? 400 : 500);

  // Deliberately thrown domain errors are expected; everything else gets logged.
  if (!err.isOperational) console.error(err);

  // A thrown error can pin its exact body (legacy per-route contracts); otherwise use the router's style.
  if (err.body !== undefined) return res.status(status).json(err.body);

  const message =
    status >= 500 && env.isProd ? "Internal server error" : err.message || "Internal server error";
  return res.status(status).json(errorBody(res.locals.responseStyle, message));
}

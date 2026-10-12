import { AppError } from "../errors/index.js";

/**
 * Wraps a call to a third party (Farmonaut, ...). When it fails, our API answers 500 — as it always has —
 * instead of inheriting the upstream status: an axios error carries `status`, so an upstream 401/404 would
 * otherwise reach errorHandler and look like OUR "unauthenticated" / "not found" to the farmer app.
 *
 *   const response = await upstream(axios.post(url, body, config));
 */
export const upstream = (call) =>
  Promise.resolve(call).catch((error) => {
    const wrapped = new AppError(error?.message || "Upstream request failed", 500, { isOperational: false });
    wrapped.cause = error;
    throw wrapped;
  });

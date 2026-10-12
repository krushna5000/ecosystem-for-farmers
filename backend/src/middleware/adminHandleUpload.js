import { BadRequestError } from "../errors/index.js";

/**
 * Wraps a multer middleware so file-filter / size-limit failures come back as a JSON 400
 * `{ success: false, message }` (the admin portal's contract) instead of a masked 500.
 */
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    return next(new BadRequestError(err.message, { body: { success: false, message: err.message } }));
  });
};

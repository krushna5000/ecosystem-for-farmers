/**
 * Wraps a multer middleware so file-filter / size-limit failures come back as a
 * JSON 400 carrying the message (the unified error handler would mask a plain
 * Error as a 500 in production).
 */
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    return res.status(400).json({ success: false, message: err.message });
  });
};

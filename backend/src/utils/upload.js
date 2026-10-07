import multer from "multer";

/**
 * Multer factory (memory storage). Files are then pushed to storage with
 * `uploadFile()` from ./storage.js.
 *
 *   const upload = createUploader({ maxSizeMB: 5, mimeTypes: ["image/png", "image/jpeg"] });
 *   router.post("/", upload.single("image"), handler);
 */
export function createUploader({ maxSizeMB = 10, mimeTypes, errorMessage } = {}) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!mimeTypes || mimeTypes.includes(file.mimetype)) return cb(null, true);
      cb(new Error(errorMessage || `Unsupported file type: ${file.mimetype}`), false);
    },
  });
}

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const PDF_MIME_TYPES = ["application/pdf"];

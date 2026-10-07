import { createUploader, IMAGE_MIME_TYPES } from "../../utils/upload.js";

// The old filter accepted any `image/*`; keep the common ones (svg intentionally left out).
const imageUploader = createUploader({
  maxSizeMB: 5,
  mimeTypes: [...IMAGE_MIME_TYPES, "image/avif", "image/bmp"],
  errorMessage: "Only image files are allowed",
});

export const uploadBrandLogo = imageUploader.single("logo");
export const uploadProductImage = imageUploader.single("image");

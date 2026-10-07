import { createUploader } from "../../utils/upload.js";

// Allow only images, 5MB
export const uploadProductImage = createUploader({
  maxSizeMB: 5,
  mimeTypes: ["image/png", "image/jpg", "image/jpeg", "image/webp"],
  errorMessage: "Only image files are allowed",
}).single("image");

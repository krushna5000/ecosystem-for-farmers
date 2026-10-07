import { createUploader } from "../../utils/upload.js";

// Only allow image files, 2MB
export const uploadBrandImage = createUploader({
  maxSizeMB: 2,
  mimeTypes: ["image/png", "image/jpg", "image/jpeg", "image/webp"],
  errorMessage: "Only image files allowed",
}).single("logo");

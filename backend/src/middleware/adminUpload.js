import { createUploader } from "../utils/upload.js";
import { handleUpload } from "./adminHandleUpload.js";

// Company logo: jpg / jpeg / png, max 2MB
const logoUploader = createUploader({
  maxSizeMB: 2,
  mimeTypes: ["image/jpeg", "image/jpg", "image/png"],
  errorMessage: "Only image files are allowed (jpg, jpeg, png).",
});

export const uploadCompanyLogo = handleUpload(logoUploader.single("logo"));

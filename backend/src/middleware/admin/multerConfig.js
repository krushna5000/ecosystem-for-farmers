import { createUploader, PDF_MIME_TYPES } from "../../utils/upload.js";
import { handleUpload } from "./handleUpload.js";

const uploadPdf = createUploader({
  maxSizeMB: 10,
  mimeTypes: PDF_MIME_TYPES,
  errorMessage: "Only PDF files are allowed",
});

// Named fields so the controller can read req.files.<field>[0]
export const uploadVendorDocs = handleUpload(uploadPdf.fields([
  { name: "shop_act_pdf", maxCount: 1 },
  { name: "gst_pdf", maxCount: 1 },
  { name: "licence_pdf", maxCount: 1 },
  { name: "pan_pdf", maxCount: 1 },
]));

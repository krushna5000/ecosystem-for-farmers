// middleware/multerConfig.js
import { uploadS3 } from "../utils/s3Upload.js";

// Export with fields configured - use this directly in routes
// Using fields() to support named field access in controller
export const uploadVendorDocs = uploadS3.fields([
  { name: "shop_act_pdf", maxCount: 1 },
  { name: "gst_pdf", maxCount: 1 },
  { name: "licence_pdf", maxCount: 1 },
  { name: "pan_pdf", maxCount: 1 },
]);

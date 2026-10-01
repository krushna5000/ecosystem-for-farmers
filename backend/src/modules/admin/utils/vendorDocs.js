import path from "path";
import { uploadFile, deleteFile } from "../../../lib/storage.js";

// field name (multipart) -> vendors column (camelCase, drizzle)
export const VENDOR_DOC_FIELDS = {
  shop_act_pdf: "shopActPdf",
  gst_pdf: "gstPdf",
  licence_pdf: "licencePdf",
  pan_pdf: "panPdf",
};

/** Uploads the PDFs received by multer and returns { shopActPdf, gstPdf, licencePdf, panPdf } (null when absent). */
export const uploadVendorDocs = async (files) => {
  const urls = {};
  for (const [field, column] of Object.entries(VENDOR_DOC_FIELDS)) {
    const file = files?.[field]?.[0];
    urls[column] = file
      ? await uploadFile({
          file,
          folder: "vendors",
          key: `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`,
        })
      : null;
  }
  return urls;
};

/** Best-effort removal of every stored PDF of a vendor row (camelCase keys). */
export const deleteVendorDocs = async (vendor) => {
  for (const column of Object.values(VENDOR_DOC_FIELDS)) {
    if (vendor[column]) await deleteFile(vendor[column]);
  }
};

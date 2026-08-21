// routes/vendorRoutes.js
import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { uploadVendorDocs } from "../middleware/multerConfig.js";
import {
  addVendorWithDocs,
  updateVendorWithDocs,
    getAllVendorsWithDocs,
    deleteVendorWithDocs
} from "../controllers/vendorController.js";

const router = express.Router();

// Create Vendor + PDF
router.post(
  "/vendors",
  adminAuth,
  uploadVendorDocs.fields([
    { name: "shop_act_pdf", maxCount: 1 },
    { name: "gst_pdf", maxCount: 1 },
    { name: "licence_pdf", maxCount: 1 },
    { name: "pan_pdf", maxCount: 1 }
  ]),
  addVendorWithDocs
);

//get all


router.get("/vendors", adminAuth, getAllVendorsWithDocs);


// Update Vendor + PDF (ONE API)
router.put(
  "/vendors/:id",
  adminAuth,
  uploadVendorDocs.fields([
    { name: "shop_act_pdf", maxCount: 1 },
    { name: "gst_pdf", maxCount: 1 },
    { name: "licence_pdf", maxCount: 1 },
    { name: "pan_pdf", maxCount: 1 }
  ]),
  updateVendorWithDocs
);

router.delete("/vendors/:id", adminAuth, deleteVendorWithDocs);


export default router;

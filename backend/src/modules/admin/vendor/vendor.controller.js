import crypto from "crypto";
import bcrypt from "bcryptjs";
import { eq, or, desc, count, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { vendors } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { sendVerifyEmail } from "../../../utils/admin/sendVerifyEmail.js";
import { sendApprovedEmail } from "../../../utils/admin/sendCompanyApprovedEmail.js";
import { checkEmailExists } from "../../../utils/admin/checkEmailExists.js";
import { verifyLink as buildVerifyLink } from "../../../utils/admin/links.js";
import { uploadVendorDocs as storeVendorDocs, deleteVendorDocs } from "../../../utils/admin/vendorDocs.js";
import { coalescePatch, dbErrorMessage, parsePagination } from "../../../utils/admin/helpers.js";

const serverError = (res) =>
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });

// ADD Vendor WITH PDFs
export const addVendorWithDocs = async (req, res) => {
  let docs = {};
  try {
    const {
      name,
      email,
      password,
      phone,
      shop_act_no,
      gst_no,
      licence_no,
      pan_no,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required",
      });
    }

    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    const [exists] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(or(eq(vendors.email, email), eq(vendors.phone, phone)));

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Vendor email or phone already exists",
      });
    }

    docs = await storeVendorDocs(req.files);

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const [vendor] = await db
      .insert(vendors)
      .values({
        name,
        email,
        password: hashedPassword,
        phone,
        shopActNo: shop_act_no || null,
        shopActPdf: docs.shopActPdf,
        gstNo: gst_no || null,
        gstPdf: docs.gstPdf,
        licenceNo: licence_no || null,
        licencePdf: docs.licencePdf,
        panNo: pan_no || null,
        panPdf: docs.panPdf,
        verifyToken,
        isActive: false,
        isApprove: false,
      })
      .returning();

    await sendVerifyEmail(email, buildVerifyLink("vendor", verifyToken));

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Verification email sent.",
      data: snakeKeys(vendor),
    });
  } catch (err) {
    await deleteVendorDocs(docs);
    console.error("addVendorWithDocs:", dbErrorMessage(err));
    return serverError(res);
  }
};

// UPDATE Vendor WITH PDFs
export const updateVendorWithDocs = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      password,
      phone,
      shop_act_no,
      gst_no,
      licence_no,
      pan_no,
      is_active,
      is_approve,
    } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const docs = await storeVendorDocs(req.files);

    // Omitted / falsy fields keep the stored value (old COALESCE behaviour).
    const patch = coalescePatch({
      name: name || null,
      email: email || null,
      password: hashedPassword || null,
      phone: phone || null,
      shopActNo: shop_act_no || null,
      shopActPdf: docs.shopActPdf,
      gstNo: gst_no || null,
      gstPdf: docs.gstPdf,
      licenceNo: licence_no || null,
      licencePdf: docs.licencePdf,
      panNo: pan_no || null,
      panPdf: docs.panPdf,
      isActive: typeof is_active === "boolean" ? is_active : null,
      isApprove: typeof is_approve === "boolean" ? is_approve : null,
    });

    const [row] = await db
      .update(vendors)
      .set(patch)
      .where(eq(vendors.id, id))
      .returning();

    if (!row) {
      await deleteVendorDocs(docs);
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.json({
      success: true,
      message: "Vendor updated successfully",
      data: snakeKeys(row),
    });
  } catch (err) {
    console.error("updateVendorWithDocs:", dbErrorMessage(err));
    return serverError(res);
  }
};

// GET ALL Vendors (with pagination support)
export const getAllVendorsWithDocs = async (req, res) => {
  try {
    const { page, limit, offset, hasPagination } = parsePagination(req.query);

    if (hasPagination) {
      const [{ total }] = await db.select({ total: count() }).from(vendors);

      const rows = await db
        .select()
        .from(vendors)
        .orderBy(desc(vendors.id))
        .limit(limit)
        .offset(offset);

      return res.json({
        success: true,
        data: snakeRows(rows),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const rows = await db.select().from(vendors).orderBy(desc(vendors.id));

    return res.json({
      success: true,
      count: rows.length,
      data: snakeRows(rows),
    });
  } catch (err) {
    console.error("getAllVendorsWithDocs:", dbErrorMessage(err));
    return serverError(res);
  }
};

// DELETE VENDOR (PERMANENT DELETE)
export const deleteVendorWithDocs = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const [deleted] = await db
      .delete(vendors)
      .where(eq(vendors.id, id))
      .returning({ id: vendors.id, name: vendors.name, email: vendors.email });

    await deleteVendorDocs(vendor);

    return res.json({
      success: true,
      message: "Vendor deleted permanently",
      data: deleted,
    });
  } catch (err) {
    console.error("deleteVendorWithDocs:", dbErrorMessage(err));
    return serverError(res);
  }
};

// TOGGLE Vendor Active / Inactive
export const toggleVendorActive = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db
      .select({ isActive: vendors.isActive })
      .from(vendors)
      .where(eq(vendors.id, id));

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const newStatus = !vendor.isActive;

    const [updated] = await db
      .update(vendors)
      .set({ isActive: newStatus, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning({
        id: vendors.id,
        name: vendors.name,
        email: vendors.email,
        is_active: vendors.isActive,
      });

    return res.json({
      success: true,
      message: `Vendor is now ${newStatus ? "ACTIVE" : "INACTIVE"}`,
      data: updated,
    });
  } catch (err) {
    console.error("toggleVendorActive:", dbErrorMessage(err));
    return serverError(res);
  }
};

// VERIFY Vendor Email
export const verifyVendorEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = crypto.randomBytes(32).toString("hex");

    const rows = await db
      .update(vendors)
      .set({ isActive: true, isApprove: true, verifyToken: resetToken })
      .where(eq(vendors.verifyToken, token))
      .returning({ email: vendors.email, name: vendors.name });

    // token was valid and verification succeeded
    if (rows.length > 0) {
      const vendor = rows[0];

      await sendApprovedEmail(vendor.email, vendor.name, vendor.email, "vendor");

      return res.json({
        success: true,
        message: "Email verified. Please set your password.",
        token: resetToken,
      });
    }

    // token not matched by the update: check whether it is still stored
    const [findByToken] = await db
      .select({ verifyToken: vendors.verifyToken })
      .from(vendors)
      .where(eq(vendors.verifyToken, token));

    if (findByToken) {
      return res.json({
        success: true,
        message: "Email already verified.",
        token: findByToken.verifyToken,
      });
    }

    // already verified: hand back the current valid token
    const [alreadyVerified] = await db
      .select({ verifyToken: vendors.verifyToken })
      .from(vendors)
      .where(eq(vendors.isApprove, true))
      .orderBy(desc(vendors.id))
      .limit(1);

    if (alreadyVerified) {
      return res.json({
        success: true,
        message: "Email already verified. You can set your password.",
        token: alreadyVerified.verifyToken,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  } catch (err) {
    console.error("verifyVendorEmail:", err);
    res.status(500).json({
      success: false,
      message: dbErrorMessage(err) || "Internal Server Error",
    });
  }
};

// RESET Vendor Password
export const resetVendorPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body ?? {};

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const rows = await db
      .update(vendors)
      .set({ password: hashedPassword, verifyToken: null })
      .where(eq(vendors.verifyToken, token))
      .returning({ id: vendors.id, email: vendors.email });

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    return res.json({
      success: true,
      message: "Vendor password reset successfully",
    });
  } catch (err) {
    console.error("resetVendorPassword:", dbErrorMessage(err));
    return serverError(res);
  }
};

// BULK DELETE VENDORS
export const bulkDeleteVendors = async (req, res) => {
  try {
    const { ids } = req.body ?? {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of vendor IDs to delete",
      });
    }

    // load first so the stored PDFs can be removed afterwards
    const vendorsToDelete = await db.select().from(vendors).where(inArray(vendors.id, ids));

    if (vendorsToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vendors found with the provided IDs",
      });
    }

    const deleted = await db
      .delete(vendors)
      .where(inArray(vendors.id, ids))
      .returning({ id: vendors.id, name: vendors.name, email: vendors.email });

    for (const vendor of vendorsToDelete) {
      await deleteVendorDocs(vendor);
    }

    return res.json({
      success: true,
      message: `${deleted.length} vendor(s) deleted permanently`,
      deletedCount: deleted.length,
      deletedVendors: deleted,
    });
  } catch (err) {
    console.error("bulkDeleteVendors:", dbErrorMessage(err));
    return serverError(res);
  }
};

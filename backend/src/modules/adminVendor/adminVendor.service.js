// Business rules for the admin vendor endpoints. Throws AppError subclasses; never touches req/res or db directly.
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  findVendorIdByEmailOrPhoneInDB,
  createVendorInDB,
  listVendorsInDB,
  listVendorsPageInDB,
  getVendorByIdInDB,
  updateVendorInDB,
  deleteVendorInDB,
  getVendorActiveStateInDB,
  setVendorActiveInDB,
  approveVendorByVerifyTokenInDB,
  findVendorVerifyTokenInDB,
  findLatestApprovedVendorInDB,
  resetVendorPasswordByTokenInDB,
  listVendorsByIdsInDB,
  deleteVendorsByIdsInDB,
} from "./adminVendor.factory.js";
import { uploadVendorDocs, deleteVendorDocs } from "./adminVendor.docs.js";
import { checkEmailExists } from "../adminAuth/adminAuth.service.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { sendVerifyEmail, sendApprovedEmail } from "../../utils/adminMail.js";
import { verifyLink } from "../../utils/adminLinks.js";
import { coalescePatch } from "../../utils/adminHelpers.js";

/** Registers a vendor with its (optional) PDFs and mails the verification link. */
export async function addVendorWithDocs(body, files) {
  const { name, email, password, phone, shop_act_no, gst_no, licence_no, pan_no } = body;

  const emailCheck = await checkEmailExists(email);
  if (emailCheck.exists) {
    throw new BadRequestError("Email already exists in system");
  }

  if (await findVendorIdByEmailOrPhoneInDB(email, phone)) {
    throw new BadRequestError("Vendor email or phone already exists");
  }

  const docs = await uploadVendorDocs(files);

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const vendor = await createVendorInDB({
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
    });

    await sendVerifyEmail(email, verifyLink("vendor", verifyToken));

    return vendor;
  } catch (err) {
    await deleteVendorDocs(docs);
    throw err;
  }
}

export async function updateVendorWithDocs(id, body, files) {
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
  } = body;

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const docs = await uploadVendorDocs(files);

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

  const row = await updateVendorInDB(id, patch);

  if (!row) {
    await deleteVendorDocs(docs);
    throw new NotFoundError("Vendor not found");
  }

  return row;
}

/** `pagination` is null unless the client sent `page` and/or `limit`. */
export async function listVendors({ page, limit, offset, hasPagination }) {
  if (!hasPagination) {
    return { rows: await listVendorsInDB(), pagination: null };
  }

  const { total, rows } = await listVendorsPageInDB({ limit, offset });
  return { rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

/** Permanent delete: the row first, then its stored PDFs. */
export async function deleteVendorWithDocs(id) {
  const vendor = await getVendorByIdInDB(id);
  if (!vendor) throw new NotFoundError("Vendor not found");

  const deleted = await deleteVendorInDB(id);

  await deleteVendorDocs(vendor);

  return deleted;
}

/** Flips `is_active`; returns the updated `{ id, name, email, is_active }`. */
export async function toggleVendorActive(id) {
  const vendor = await getVendorActiveStateInDB(id);
  if (!vendor) throw new NotFoundError("Vendor not found");

  return setVendorActiveInDB(id, !vendor.isActive);
}

/**
 * Activates + approves the vendor that owns the verification token, mails the approval and hands back a fresh
 * reset token. Unknown / already-used tokens fall back to the legacy "already verified" answers.
 *
 * @returns {Promise<{message: string, token: string|null}>}
 */
export async function verifyVendorEmail(token) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const rows = await approveVendorByVerifyTokenInDB(token, resetToken);

  // token was valid and verification succeeded
  if (rows.length > 0) {
    const vendor = rows[0];

    await sendApprovedEmail(vendor.email, vendor.name, vendor.email, "vendor");

    return { message: "Email verified. Please set your password.", token: resetToken };
  }

  // token not matched by the update: check whether it is still stored
  const findByToken = await findVendorVerifyTokenInDB(token);
  if (findByToken) {
    return { message: "Email already verified.", token: findByToken.verifyToken };
  }

  // already verified: hand back the current valid token
  const alreadyVerified = await findLatestApprovedVendorInDB();
  if (alreadyVerified) {
    return { message: "Email already verified. You can set your password.", token: alreadyVerified.verifyToken };
  }

  throw new BadRequestError("Invalid or expired verification token");
}

export async function resetVendorPassword(token, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const rows = await resetVendorPasswordByTokenInDB(token, hashedPassword);
  if (rows.length === 0) throw new BadRequestError("Invalid or expired reset token");
}

export async function bulkDeleteVendors(ids) {
  // load first so the stored PDFs can be removed afterwards
  const vendorsToDelete = await listVendorsByIdsInDB(ids);

  if (vendorsToDelete.length === 0) {
    throw new NotFoundError("No vendors found with the provided IDs");
  }

  const deleted = await deleteVendorsByIdsInDB(ids);

  for (const vendor of vendorsToDelete) {
    await deleteVendorDocs(vendor);
  }

  return deleted;
}

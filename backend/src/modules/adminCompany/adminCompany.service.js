// Business rules for the admin company endpoints. Throws AppError subclasses; never touches req/res or db directly.
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  findCompanyIdByEmailInDB,
  findCompanyIdByGstNoInDB,
  findCompanyIdByPhoneInDB,
  createCompanyInDB,
  listCompaniesInDB,
  listCompaniesPageInDB,
  getCompanyByIdInDB,
  updateCompanyInDB,
  deleteCompanyInDB,
  getCompanyActiveStateInDB,
  setCompanyActiveInDB,
  resetCompanyPasswordByTokenInDB,
  approveCompanyByVerifyTokenInDB,
  findCompanyVerifyTokenInDB,
  findLatestApprovedCompanyInDB,
  deleteCompaniesByIdsInDB,
} from "./adminCompany.factory.js";
import { checkEmailExists } from "../adminAuth/adminAuth.service.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { uploadFile, deleteFile } from "../../utils/storage.js";
import { sendVerifyEmail, sendApprovedEmail } from "../../utils/adminMail.js";
import { verifyLink } from "../../utils/adminLinks.js";
import { coalescePatch, dbFailure, guardDb } from "../../utils/adminHelpers.js";

const LOGO_FOLDER = "companies";

// "" -> null (the old code normalised blank form fields before COALESCE)
const blankToNull = (v) => (v === "" ? null : v);

// Duplicate-field failures carry the offending field next to the message.
const duplicateField = (field, message) =>
  new BadRequestError(message, { body: { success: false, field, message } });

// Failing writes keep the legacy contract: 500 { success:false, message: <driver message> } (see utils/adminHelpers.js).

/** Registers a company (optionally with a logo) and mails the verification link. */
export async function addCompany(body, file) {
  const { company_type, llp_no, cin_no, email, password, name, address, gst_no, phone } = body;

  let logoUrl = null;
  try {
    const emailCheck = await checkEmailExists(email);
    if (emailCheck?.exists) {
      throw new BadRequestError("Email already exists in system");
    }

    if (await findCompanyIdByEmailInDB(email)) throw duplicateField("email", "Email already exists");
    if (await findCompanyIdByGstNoInDB(gst_no)) throw duplicateField("gst_no", "GST number already exists");
    if (await findCompanyIdByPhoneInDB(phone)) throw duplicateField("phone", "Phone number already exists");

    // Companies may be created without a password; it is set later via the reset-password link.
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    if (file) {
      logoUrl = await uploadFile({ file, folder: LOGO_FOLDER });
    }

    const company = await createCompanyInDB({
      companyType: company_type,
      llpNo: llp_no || null,
      cinNo: cin_no || null,
      email,
      password: hashedPassword,
      name,
      address,
      gstNo: gst_no,
      phone,
      verifyToken,
      logoUrl,
    });

    // sendVerifyEmail never throws; it reports failure through its return value
    const emailSent = await sendVerifyEmail(email, verifyLink("company", verifyToken));

    return { company, emailSent };
  } catch (err) {
    if (logoUrl) await deleteFile(logoUrl);
    throw dbFailure(err);
  }
}

/** `pagination` is null unless the client sent `page` and/or `limit`. */
export async function listCompanies({ page, limit, offset, hasPagination }) {
  if (!hasPagination) {
    return { rows: await listCompaniesInDB(), pagination: null };
  }

  const { total, rows } = await listCompaniesPageInDB({ limit, offset });
  return { rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getCompanyById(id) {
  const row = await getCompanyByIdInDB(id);
  if (!row) throw new NotFoundError("Company not found");
  return row;
}

export async function updateCompany(id, body, file) {
  const {
    company_type,
    email,
    password,
    llp_no,
    cin_no,
    name,
    address,
    gst_no,
    phone,
    is_active,
    is_approved,
  } = body;

  const logoUrl = file ? await uploadFile({ file, folder: LOGO_FOLDER }) : null;

  const hashed = password ? await bcrypt.hash(password, 10) : null;

  // Blank form values and omitted fields keep the stored value (old COALESCE behaviour).
  const patch = coalescePatch({
    companyType: blankToNull(company_type),
    email: blankToNull(email),
    password: hashed,
    llpNo: blankToNull(llp_no),
    cinNo: blankToNull(cin_no),
    name: blankToNull(name),
    address: blankToNull(address),
    gstNo: blankToNull(gst_no),
    phone: blankToNull(phone),
    isActive: typeof is_active === "boolean" ? is_active : null,
    isApproved: typeof is_approved === "boolean" ? is_approved : null,
    logoUrl,
  });

  const row = await guardDb(updateCompanyInDB(id, patch));

  if (!row) {
    await deleteFile(logoUrl);
    throw new NotFoundError("Company not found");
  }

  return row;
}

export async function deleteCompany(id) {
  const deleted = await guardDb(deleteCompanyInDB(id));
  if (!deleted) throw new NotFoundError("Company not found");
  return deleted;
}

/** Flips `is_active`; returns the updated `{ id, name, email, is_active }`. */
export async function toggleCompanyActive(id) {
  const company = await getCompanyActiveStateInDB(id);
  if (!company) throw new NotFoundError("Company not found");

  return guardDb(setCompanyActiveInDB(id, !company.isActive));
}

export async function resetCompanyPassword(token, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const rows = await guardDb(resetCompanyPasswordByTokenInDB(token, hashedPassword));
  if (rows.length === 0) throw new BadRequestError("Invalid or expired reset token");
}

/**
 * Approves the company that owns the verification token, mails the approval and hands back a fresh
 * reset token. Unknown / already-used tokens fall back to the legacy "already verified" answers.
 *
 * @returns {Promise<{message: string, token: string|null}>}
 */
export async function verifyCompanyEmail(token) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const rows = await guardDb(approveCompanyByVerifyTokenInDB(token, resetToken));

  if (rows.length > 0) {
    const company = rows[0];

    let approvedEmailSent = true;

    try {
      await sendApprovedEmail(company.email, company.name, company.email, "company");
    } catch (emailErr) {
      approvedEmailSent = false;
      console.error("sendApprovedEmail failed:", emailErr.message);
    }

    return {
      message: approvedEmailSent
        ? "Email verified successfully. Approval email sent."
        : "Email verified, but approved email could not be sent.",
      token: resetToken,
    };
  }

  const findByToken = await findCompanyVerifyTokenInDB(token);
  if (findByToken) {
    return { message: "Email already verified.", token: findByToken.verifyToken };
  }

  const alreadyVerified = await findLatestApprovedCompanyInDB();
  if (alreadyVerified) {
    return { message: "Email already verified.", token: alreadyVerified.verifyToken };
  }

  throw new BadRequestError("Invalid or expired verification token");
}

export async function bulkDeleteCompanies(ids) {
  const deleted = await deleteCompaniesByIdsInDB(ids);
  if (deleted.length === 0) throw new NotFoundError("No companies found with the provided IDs");
  return deleted;
}

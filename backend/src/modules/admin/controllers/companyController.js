import bcrypt from "bcryptjs";
import crypto from "crypto";
import { eq, desc, count, inArray, getTableColumns } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { companies, companyTypes } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";
import { uploadFile, deleteFile } from "../../../lib/storage.js";
import { sendVerifyEmail } from "../utils/sendVerifyEmail.js";
import { sendApprovedEmail } from "../utils/sendCompanyApprovedEmail.js";
import { checkEmailExists } from "../utils/checkEmailExists.js";
import { verifyLink as buildVerifyLink } from "../utils/links.js";
import { blankToNull, coalescePatch, dbErrorMessage, parsePagination } from "../utils/helpers.js";

const failure = (res, err, label) => {
  console.error(`${label}:`, err);
  return res.status(500).json({
    success: false,
    message: dbErrorMessage(err) || "Internal Server Error",
  });
};

// companies.* plus the joined company type name
const selectCompanies = () =>
  db
    .select({ ...getTableColumns(companies), company_type_name: companyTypes.type })
    .from(companies)
    .leftJoin(companyTypes, eq(companies.companyType, companyTypes.id));

// ADD COMPANY
export const addCompany = async (req, res) => {
  let logoUrl = null;
  try {
    const {
      company_type,
      llp_no,
      cin_no,
      email,
      password,
      name,
      address,
      gst_no,
      phone,
    } = req.body;

    if (!company_type || !email || !name || !address || !gst_no || !phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const emailCheck = await checkEmailExists(email);

    if (emailCheck?.exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists in system",
      });
    }

    const [emailExists] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.email, email));

    if (emailExists) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Email already exists",
      });
    }

    const [gstExists] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.gstNo, gst_no));

    if (gstExists) {
      return res.status(400).json({
        success: false,
        field: "gst_no",
        message: "GST number already exists",
      });
    }

    const [phoneExists] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.phone, phone));

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        field: "phone",
        message: "Phone number already exists",
      });
    }

    // Companies may be created without a password; it is set later via the reset-password link.
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const verifyToken = crypto.randomBytes(32).toString("hex");

    if (req.file) {
      logoUrl = await uploadFile({ file: req.file, folder: "companies" });
    }

    const [inserted] = await db
      .insert(companies)
      .values({
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
      })
      .returning({
        id: companies.id,
        company_type: companies.companyType,
        email: companies.email,
        name: companies.name,
        address: companies.address,
        gst_no: companies.gstNo,
        phone: companies.phone,
        verify_token: companies.verifyToken,
        logo_url: companies.logoUrl,
        created_at: companies.createdAt,
      });

    const verifyLink = buildVerifyLink("company", verifyToken);

    // sendVerifyEmail never throws; it reports failure through its return value
    const emailSent = await sendVerifyEmail(email, verifyLink);

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Company registered. Verification email sent."
        : "Company registered, but verification email could not be sent.",
      data: inserted,
    });
  } catch (err) {
    if (logoUrl) await deleteFile(logoUrl);
    return failure(res, err, "addCompany");
  }
};

// GET ALL COMPANIES
export const getAllCompanies = async (req, res) => {
  try {
    const { page, limit, offset, hasPagination } = parsePagination(req.query);

    if (hasPagination) {
      const [{ total }] = await db.select({ total: count() }).from(companies);

      const rows = await selectCompanies()
        .orderBy(desc(companies.id))
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

    const rows = await selectCompanies().orderBy(desc(companies.id));

    res.json({
      success: true,
      data: snakeRows(rows),
    });
  } catch (err) {
    failure(res, err, "getAllCompanies");
  }
};

// GET COMPANY BY ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const [row] = await selectCompanies().where(eq(companies.id, id));

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: snakeKeys(row),
    });
  } catch (err) {
    failure(res, err, "getCompanyById");
  }
};

// UPDATE COMPANY
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

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
    } = req.body;

    const logoUrl = req.file ? await uploadFile({ file: req.file, folder: "companies" }) : null;

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

    const [row] = await db
      .update(companies)
      .set(patch)
      .where(eq(companies.id, id))
      .returning();

    if (!row) {
      await deleteFile(logoUrl);
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      data: snakeKeys(row),
    });
  } catch (err) {
    failure(res, err, "updateCompany");
  }
};

// DELETE COMPANY
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(companies)
      .where(eq(companies.id, id))
      .returning({ id: companies.id, name: companies.name, email: companies.email });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.json({
      success: true,
      message: "Company deleted permanently",
      deleted_company: deleted,
    });
  } catch (err) {
    failure(res, err, "deleteCompany");
  }
};

// TOGGLE COMPANY ACTIVE
export const toggleCompanyActive = async (req, res) => {
  try {
    const { id } = req.params;

    const [company] = await db
      .select({ isActive: companies.isActive })
      .from(companies)
      .where(eq(companies.id, id));

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const newStatus = !company.isActive;

    const [updated] = await db
      .update(companies)
      .set({ isActive: newStatus, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        is_active: companies.isActive,
      });

    res.json({
      success: true,
      message: `Company is now ${newStatus ? "ACTIVE" : "INACTIVE"}`,
      data: updated,
    });
  } catch (err) {
    failure(res, err, "toggleCompanyActive");
  }
};

// RESET COMPANY PASSWORD
export const resetCompanyPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body ?? {};

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const rows = await db
      .update(companies)
      .set({ password: hashedPassword, verifyToken: null })
      .where(eq(companies.verifyToken, token))
      .returning({ id: companies.id, email: companies.email });

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    failure(res, err, "resetCompanyPassword");
  }
};

// VERIFY COMPANY EMAIL
export const verifyCompanyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const resetToken = crypto.randomBytes(32).toString("hex");

    const rows = await db
      .update(companies)
      .set({ isApproved: true, verifyToken: resetToken })
      .where(eq(companies.verifyToken, token))
      .returning({ email: companies.email, name: companies.name });

    if (rows.length > 0) {
      const company = rows[0];

      let approvedEmailSent = true;

      try {
        await sendApprovedEmail(company.email, company.name, company.email, "company");
      } catch (emailErr) {
        approvedEmailSent = false;
        console.error("sendApprovedEmail failed:", emailErr.message);
      }

      return res.json({
        success: true,
        message: approvedEmailSent
          ? "Email verified successfully. Approval email sent."
          : "Email verified, but approved email could not be sent.",
        token: resetToken,
      });
    }

    const [findByToken] = await db
      .select({ verifyToken: companies.verifyToken })
      .from(companies)
      .where(eq(companies.verifyToken, token));

    if (findByToken) {
      return res.json({
        success: true,
        message: "Email already verified.",
        token: findByToken.verifyToken,
      });
    }

    const [alreadyVerified] = await db
      .select({ verifyToken: companies.verifyToken })
      .from(companies)
      .where(eq(companies.isApproved, true))
      .orderBy(desc(companies.id))
      .limit(1);

    if (alreadyVerified) {
      return res.json({
        success: true,
        message: "Email already verified.",
        token: alreadyVerified.verifyToken,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  } catch (err) {
    failure(res, err, "verifyCompanyEmail");
  }
};

// Bulk-delete company
export const bulkDeleteCompanies = async (req, res) => {
  try {
    const { ids } = req.body ?? {};

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of company IDs to delete",
      });
    }

    const deleted = await db
      .delete(companies)
      .where(inArray(companies.id, ids))
      .returning({ id: companies.id, name: companies.name, email: companies.email });

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No companies found with the provided IDs",
      });
    }

    res.json({
      success: true,
      message: `${deleted.length} company(ies) deleted permanently`,
      deletedCount: deleted.length,
      deletedCompanies: deleted,
    });
  } catch (err) {
    console.error("bulkDeleteCompanies:", dbErrorMessage(err));
    res.status(500).json({ error: "Internal Server Error" });
  }
};

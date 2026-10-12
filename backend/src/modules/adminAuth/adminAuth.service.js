// Business rules for the admin portal's login and the cross-identity email check. Throws AppError subclasses;
// never touches req/res or db directly.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findAdminByEmailInDB, findEmailSourcesInDB } from "./adminAuth.factory.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/index.js";
import { portalSecret } from "../../utils/jwt.js";
import { messageOnly } from "../../utils/adminHelpers.js";

/** Verifies the credentials and returns the signed admin JWT (payload `{ id, email }`, valid for one day). */
export async function loginAdmin(email, password) {
  const admin = await findAdminByEmailInDB(email ?? null);

  if (!admin) {
    throw new NotFoundError("Admin not found", messageOnly("Admin not found"));
  }

  if (!admin.isActive) {
    throw new ForbiddenError("Admin account is deactivated", messageOnly("Admin account is deactivated"));
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials", messageOnly("Invalid credentials"));
  }

  return jwt.sign({ id: admin.id, email: admin.email }, portalSecret("admin"), { expiresIn: "1d" });
}

/**
 * Looks the email up across super admins, admins, vendors and companies (company / vendor registration uses it).
 * A failing lookup never blocks the caller: it reports `exists: false` plus the error.
 */
export async function checkEmailExists(email) {
  try {
    const rows = await findEmailSourcesInDB(email);

    if (rows.length > 0) {
      return { exists: true, foundIn: rows[0].source };
    }

    return { exists: false, foundIn: null };
  } catch (error) {
    console.error("checkEmailExists error:", error.cause?.message || error.message);
    return { exists: false, foundIn: null, error: error.cause?.message || error.message };
  }
}

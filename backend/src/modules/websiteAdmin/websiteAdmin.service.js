// Business rules for the website CMS admin account. Throws AppError subclasses; never touches req/res or db directly.
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminEmailExistsInDB, getAdminByEmailInDB, createAdminInDB } from "./websiteAdmin.factory.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../../errors/index.js";
import { portalSecret } from "../../utils/jwt.js";
import { withLegacy500 } from "../../utils/websiteHelpers.js";

// This portal's admin endpoints answer `{ error }`, not the router's `{ success, message }` envelope.
const errorOptions = (message) => ({ body: { error: message } });

export function registerAdmin({ admin_name, email, password }) {
  return withLegacy500("Admin Registration Error:", async () => {
    if (!admin_name || !email || !password) {
      throw new BadRequestError("All fields are required", errorOptions("All fields are required"));
    }

    if (await adminEmailExistsInDB(email)) {
      throw new ConflictError("Email already registered", errorOptions("Email already registered"));
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return createAdminInDB({
      adminId: crypto.randomUUID(),
      adminName: admin_name,
      email,
      passwordHash,
    });
  });
}

/** Verifies the credentials and returns the signed session token (the controller puts it in the cookie). */
export function loginAdmin({ email, password }) {
  return withLegacy500("Admin Login Error:", async () => {
    const admin = await getAdminByEmailInDB(String(email ?? ""));
    if (!admin) throw new NotFoundError("Admin not found", errorOptions("Admin not found"));

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) throw new UnauthorizedError("Invalid password", errorOptions("Invalid password"));

    return jwt.sign({ admin_id: admin.adminId, email: admin.email }, portalSecret("website"), {
      expiresIn: "7d",
    });
  });
}

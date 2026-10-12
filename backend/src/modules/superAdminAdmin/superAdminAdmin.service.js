// Business rules for super admin login and admin account management. Throws AppError subclasses;
// never touches the HTTP request/response or db.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  emailExistsInDB,
  findSuperAdminByEmailInDB,
  createAdminInDB,
  listAdminsInDB,
  getAdminByIdInDB,
  updateAdminInDB,
  deleteAdminInDB,
  findExistingAdminIdsInDB,
  bulkDeleteAdminsInDB,
} from "./superAdminAdmin.factory.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../../errors/index.js";
import { errorMessage } from "../../errors/dbError.js";
import { portalSecret } from "../../utils/jwt.js";

/** True when the email is used by a super admin, admin, vendor or company. */
export const emailExists = (email) => emailExistsInDB(email);

/** Verifies the credentials and returns a 30-day JWT for the super admin cookie. */
export async function loginSuperAdmin(email, password) {
  const admin = await findSuperAdminByEmailInDB(email);
  if (!admin) throw new BadRequestError("Invalid email or password");

  const match = await bcrypt.compare(password, admin.password);
  if (!match) throw new BadRequestError("Invalid email or password");

  try {
    return jwt.sign({ id: admin.id }, portalSecret("super-admin"), { expiresIn: "30d" });
  } catch (err) {
    const message = "Failed to generate token";
    throw new AppError(message, 500, { body: { success: false, message, error: errorMessage(err) } });
  }
}

export async function createAdmin({ name, email, password }) {
  if (await emailExistsInDB(email)) throw new ConflictError("Email already exists in system");

  const hashedPassword = await bcrypt.hash(password, 10);
  return createAdminInDB({ name: name.trim(), email, password: hashedPassword });
}

export function listAdmins() {
  return listAdminsInDB();
}

async function requireAdmin(id) {
  const admin = await getAdminByIdInDB(id);
  if (!admin) throw new NotFoundError("Admin not found");
  return admin;
}

export async function updateAdmin(id, { name, email }) {
  await requireAdmin(id);
  await updateAdminInDB(id, { name, email });
}

export async function deleteAdmin(id) {
  await requireAdmin(id);
  await deleteAdminInDB(id);
}

export async function bulkDeleteAdmins(ids) {
  const existing = await findExistingAdminIdsInDB(ids);
  if (existing.length === 0) throw new NotFoundError("No admins found with provided ids");

  const deletedIds = await bulkDeleteAdminsInDB(ids);
  return { deletedCount: deletedIds.length, deletedIds };
}

export async function updateAdminPassword(id, newPassword) {
  const admin = await requireAdmin(id);

  if (await bcrypt.compare(newPassword, admin.password)) {
    throw new BadRequestError("New password cannot be same as current password");
  }

  await updateAdminInDB(id, { password: await bcrypt.hash(newPassword, 10) });
}

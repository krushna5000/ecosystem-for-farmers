// Business rules for the company session (login, password change, profile). Throws AppError subclasses;
// never touches req/res or db directly.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findCompanyByEmailInDB,
  findCompanyPasswordByIdInDB,
  updateCompanyPasswordInDB,
  getCompanyProfileByIdInDB,
} from "./companyAuth.factory.js";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../errors/index.js";
import { portalSecret } from "../../utils/jwt.js";

// These endpoints answer failures with a bare `{ message }` (no success flag): the body is pinned.
const bare = (message) => ({ body: { message } });

/** Verifies the credentials and returns the signed session token (the controller sets the cookie). */
export async function loginCompany({ email, password }) {
  const company = await findCompanyByEmailInDB(email ?? null);
  if (!company) throw new NotFoundError("Company does not exist", bare("Company does not exist"));

  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) throw new UnauthorizedError("Invalid password", bare("Invalid password"));

  if (company.isActive === false) {
    const message = "Company account is deactivated. Please contact support.";
    throw new ForbiddenError(message, bare(message));
  }

  return jwt.sign(
    {
      id: company.id,
      email: company.email,
      type: company.companyType,
    },
    portalSecret("company"),
    { expiresIn: "7d" },
  );
}

export async function updateCompanyPassword(companyId, { oldPassword, newPassword }) {
  const company = await findCompanyPasswordByIdInDB(companyId);
  if (!company) throw new NotFoundError("Company not found", bare("Company not found"));

  const isMatch = await bcrypt.compare(oldPassword, company.password);
  if (!isMatch) throw new UnauthorizedError("Incorrect old password", bare("Incorrect old password"));

  const hashed = await bcrypt.hash(newPassword, 10);
  await updateCompanyPasswordInDB(companyId, hashed);
}

/** The profile row, or null when the company no longer exists. */
export function getCompanyProfile(companyId) {
  return getCompanyProfileByIdInDB(companyId);
}

// Business rules for the admin-issued company OTP. Throws AppError subclasses; never touches req/res or db directly.
// OTP-in-response-body is a known legacy behaviour (README "known issues") and is preserved.
import {
  findCompanyIdInDB,
  createCompanyOtpInDB,
  findLatestCompanyOtpInDB,
  approveCompanyInDB,
} from "./adminCompanyOtp.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { generateOtp, messageOnly } from "../../utils/adminHelpers.js";

const OTP_TTL_MS = 1 * 60 * 1000; // 1 minute

// Every failure of these endpoints answers `{ message }` (no `success` flag).
const badRequest = (message) => new BadRequestError(message, messageOnly(message));
const notFound = (message) => new NotFoundError(message, messageOnly(message));

export async function sendOtpToCompany({ company_id, phone }) {
  if (!company_id || !phone) throw badRequest("company_id and phone required");

  const company = await findCompanyIdInDB(company_id);
  if (!company) throw notFound("Company not found");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await createCompanyOtpInDB({ companyId: company_id, phone, otpCode: otp, expiresAt });

  return { otp, expiresAt };
}

/** Checks the latest OTP and approves the company. */
export async function verifyCompanyOtp({ company_id, otp_code }) {
  if (!company_id || !otp_code) throw badRequest("company_id and otp_code required");

  const otpRecord = await findLatestCompanyOtpInDB(company_id);
  if (!otpRecord) throw notFound("OTP not found");

  if (new Date() > otpRecord.expiresAt) throw badRequest("OTP expired");

  if (otpRecord.otpCode !== otp_code) throw badRequest("Invalid OTP");

  return approveCompanyInDB(company_id);
}

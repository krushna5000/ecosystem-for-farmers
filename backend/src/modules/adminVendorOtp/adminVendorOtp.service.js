// Business rules for the admin-issued vendor OTP. Throws AppError subclasses; never touches req/res or db directly.
// OTP-in-response-body is a known legacy behaviour (README "known issues") and is preserved.
import {
  findVendorIdInDB,
  createVendorOtpInDB,
  findLatestVendorOtpInDB,
  approveVendorInDB,
} from "./adminVendorOtp.factory.js";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import { generateOtp, messageOnly } from "../../utils/adminHelpers.js";

const OTP_TTL_MS = 1 * 60 * 1000; // 1 minute

// Every failure of these endpoints answers `{ message }` (no `success` flag).
const badRequest = (message) => new BadRequestError(message, messageOnly(message));
const notFound = (message) => new NotFoundError(message, messageOnly(message));

export async function sendVendorOtp({ vendor_id, email }) {
  if (!vendor_id || !email) throw badRequest("vendor_id and email are required");

  const vendor = await findVendorIdInDB(vendor_id);
  if (!vendor) throw notFound("Vendor not found");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await createVendorOtpInDB({ vendorId: vendor_id, email, otp, expiresAt });

  return { otp, expiresAt };
}

/** Checks the latest OTP and approves the vendor. */
export async function verifyVendorOtp({ vendor_id, otp }) {
  if (!vendor_id || !otp) throw badRequest("vendor_id and otp are required");

  const otpRecord = await findLatestVendorOtpInDB(vendor_id);
  if (!otpRecord) throw notFound("OTP not found");

  if (new Date() > otpRecord.expiresAt) throw badRequest("OTP expired");

  if (otpRecord.otp !== otp) throw badRequest("Invalid OTP");

  return approveVendorInDB(vendor_id);
}

import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { otpVerifications } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";

const createOtp = async (phone_number, otp_code) => {
  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity
  await db.insert(otpVerifications).values({
    phoneNumber: phone_number,
    otpCode: otp_code,
    expiresAt: expires_at,
  });
};

const findOtp = async (phone_number, otp_code) => {
  const [row] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.phoneNumber, phone_number),
        eq(otpVerifications.otpCode, otp_code),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpVerifications.id))
    .limit(1);
  return snakeKeys(row);
};

const markOtpUsed = async (otpId) => {
  await db.update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, otpId));
};

export { createOtp, findOtp, markOtpUsed };

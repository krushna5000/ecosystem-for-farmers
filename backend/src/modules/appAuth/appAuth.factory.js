// Pure DB I/O for user_schema.users and user_schema.otp_verifications. No business rules, no req/res.
// Rows come back in the snake_case shape the farmer-app clients (and req.user) have always used.
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "../../db/connection.js";
import { users, otpVerifications } from "./appAuth.schema.js";
import { snakeKeys } from "../../utils/rowCase.js";

const exec = (tx) => tx ?? db;

export async function findUserByPhoneInDB(phoneNumber, tx) {
  const [row] = await exec(tx).select().from(users).where(eq(users.phoneNumber, phoneNumber));
  return snakeKeys(row);
}

export async function createUserInDB({ fullName, phoneNumber, userType }, tx) {
  const [row] = await exec(tx).insert(users).values({ fullName, phoneNumber, userType }).returning();
  return snakeKeys(row);
}

export async function markUserVerifiedInDB(userId, tx) {
  await exec(tx).update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, userId));
}

const profileColumns = {
  id: users.id,
  phoneNumber: users.phoneNumber,
  fullName: users.fullName,
  language: users.language,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

// null/undefined fullName or language keep the existing value (COALESCE)
export async function updateUserProfileInDB(userId, fullName, language, tx) {
  const [row] = await exec(tx)
    .update(users)
    .set({
      fullName: fullName ?? undefined,
      language: language ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(profileColumns);
  return snakeKeys(row);
}

export async function createOtpInDB({ phoneNumber, otpCode, expiresAt }, tx) {
  await exec(tx).insert(otpVerifications).values({ phoneNumber, otpCode, expiresAt });
}

/** Newest unused, unexpired OTP row for this phone + code (or undefined). */
export async function findValidOtpInDB(phoneNumber, otpCode, tx) {
  const [row] = await exec(tx)
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.phoneNumber, phoneNumber),
        eq(otpVerifications.otpCode, otpCode),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpVerifications.id))
    .limit(1);
  return snakeKeys(row);
}

export async function markOtpUsedInDB(otpId, tx) {
  await exec(tx).update(otpVerifications).set({ isUsed: true }).where(eq(otpVerifications.id, otpId));
}

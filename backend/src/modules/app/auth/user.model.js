import { eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { users } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";

const findUserByPhone = async (phone_number) => {
  const [row] = await db.select().from(users).where(eq(users.phoneNumber, phone_number));
  return snakeKeys(row);
};

const createUser = async (full_name, phone_number, user_type) => {
  const [row] = await db
    .insert(users)
    .values({ fullName: full_name, phoneNumber: phone_number, userType: user_type })
    .returning();
  return snakeKeys(row);
};

const updateUserVerified = async (userId) => {
  await db.update(users).set({ isVerified: true, updatedAt: new Date() }).where(eq(users.id, userId));
};

const profileColumns = {
  id: users.id,
  phoneNumber: users.phoneNumber,
  fullName: users.fullName,
  language: users.language,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

// null/undefined fullName or language keep the existing value (COALESCE)
const updateUserProfile = async (userId, fullName, language) => {
  const [row] = await db
    .update(users)
    .set({
      fullName: fullName ?? undefined,
      language: language ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(profileColumns);
  return snakeKeys(row);
};

const getUserById = async (userId) => {
  const [row] = await db.select(profileColumns).from(users).where(eq(users.id, userId));
  return snakeKeys(row);
};

export { findUserByPhone, createUser, updateUserVerified, updateUserProfile, getUserById };

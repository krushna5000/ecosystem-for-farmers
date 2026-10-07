import { eq, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { users } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";

// Normalize phone number: strip +91, 91 prefix → get raw 10-digit number
function normalizePhone(phone) {
  let cleaned = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  }
  return cleaned;
}

// Check if user exists in DB by trying all possible phone formats
const findUserByWhatsappNumber = async (whatsappNumber) => {
  const raw10 = normalizePhone(whatsappNumber);

  const [row] = await db
    .select()
    .from(users)
    .where(inArray(users.phoneNumber, [raw10, `91${raw10}`, `+91${raw10}`]))
    .limit(1);
  return snakeKeys(row) || null;
};

// Register new WhatsApp user in the DB
const registerWhatsappUser = async (fullName, phoneNumber) => {
  const raw10 = normalizePhone(phoneNumber);

  const [row] = await db
    .insert(users)
    .values({ fullName, phoneNumber: raw10, userType: "whatsapp", isVerified: true })
    .returning();
  return snakeKeys(row);
};

export { findUserByWhatsappNumber, registerWhatsappUser, normalizePhone };

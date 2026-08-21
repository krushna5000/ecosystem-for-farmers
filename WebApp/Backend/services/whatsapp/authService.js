import db from "../../config/db.js";

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
  const with91 = `91${raw10}`;
  const withPlus91 = `+91${raw10}`;

  const result = await db.query(
    `SELECT * FROM user_schema.users 
     WHERE phone_number = $1 
        OR phone_number = $2 
        OR phone_number = $3 
     LIMIT 1`,
    [raw10, with91, withPlus91]
  );
  return result.rows[0] || null;
};

// Register new WhatsApp user in the DB
const registerWhatsappUser = async (fullName, phoneNumber) => {
  const raw10 = normalizePhone(phoneNumber);
  
  const result = await db.query(
    `INSERT INTO user_schema.users (full_name, phone_number, user_type, is_verified)
     VALUES ($1, $2, 'whatsapp', true)
     RETURNING *`,
    [fullName, raw10]
  );
  return result.rows[0];
};

export { findUserByWhatsappNumber, registerWhatsappUser, normalizePhone };

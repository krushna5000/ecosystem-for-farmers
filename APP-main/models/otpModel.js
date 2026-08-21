import db from '../config/db.js';

const createOtp = async (phone_number, otp_code) => {
  const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 min validity
  await db.query(
    `INSERT INTO user_schema.otp_verifications (phone_number, otp_code, expires_at)
     VALUES ($1, $2, $3)`,
    [phone_number, otp_code, expires_at]
  );
};

const findOtp = async (phone_number, otp_code) => {
  const result = await db.query(
    `SELECT * FROM user_schema.otp_verifications
     WHERE phone_number = $1 AND otp_code = $2 AND is_used = false AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [phone_number, otp_code]
  );
  return result.rows[0];
};

const markOtpUsed = async (otpId) => {
  await db.query(
    `UPDATE user_schema.otp_verifications SET is_used = true WHERE id = $1`,
    [otpId]
  );
};

export { createOtp, findOtp, markOtpUsed };

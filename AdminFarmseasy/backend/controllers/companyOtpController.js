import pool from "../config/db.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ============================================================
   1. SEND OTP TO COMPANY
============================================================ */
export const sendOtpToCompany = async (req, res) => {
  try {
    const { company_id, phone } = req.body;

    if (!company_id || !phone) {
      return res.status(400).json({ message: "company_id and phone required" });
    }

    // Check if company exists
    const company = await pool.query(
      `SELECT id FROM company_schema.companies WHERE id = $1`,
      [company_id]
    );

    if (company.rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 5 minutes

    await pool.query(
      `INSERT INTO company_schema.company_otp
       (company_id, phone, otp_code, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [company_id, phone, otp, expiresAt]
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // remove in production
      expires_at: expiresAt
    });

  } catch (error) {
    console.error("sendOtpToCompany:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/* ============================================================
   2. VERIFY COMPANY OTP + APPROVE COMPANY
============================================================ */
export const verifyCompanyOtp = async (req, res) => {
  try {
    const { company_id, otp_code } = req.body;

    if (!company_id || !otp_code) {
      return res.status(400).json({ message: "company_id and otp_code required" });
    }

    // Get latest OTP
    const result = await pool.query(
      `SELECT * FROM company_schema.company_otp
       WHERE company_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "OTP not found" });
    }

    const otpRecord = result.rows[0];

    // Check expiry
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check OTP match
    if (otpRecord.otp_code !== otp_code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ⭐ UPDATE company approval status
    const updated = await pool.query(
      `UPDATE company_schema.companies
       SET is_approved = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, email, phone, gst_no, is_approved`,
      [company_id]
    );

    res.json({
      success: true,
      message: "OTP verified & company approved successfully",
      company: updated.rows[0]
    });

  } catch (error) {
    console.error("verifyCompanyOtp:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// controllers/vendorOtpController.js
import pool from "../config/db.js";

// Generate 6-digit random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const sendVendorOtp = async (req, res) => {
  try {
    const { vendor_id, email } = req.body;

    if (!vendor_id || !email) {
      return res.status(400).json({ message: "vendor_id and email are required" });
    }

    // Check if vendor exists
    const vendor = await pool.query(
      `SELECT id FROM vendor_schema.vendors WHERE id = $1`,
      [vendor_id]
    );

    if (vendor.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 5 mins

    // Insert OTP into vendor_otp table
    await pool.query(
      `INSERT INTO vendor_schema.vendor_otp
        (vendor_id, email, otp, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [vendor_id, email, otp, expiresAt]
    );

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // REMOVE in production
      expires_at: expiresAt
    });

  } catch (error) {
    console.error("sendVendorOtp:", error.message);
    res.status(500).json({ error: error.message });
  }
};


export const verifyVendorOtp = async (req, res) => {
  try {
    const { vendor_id, otp } = req.body;

    if (!vendor_id || !otp) {
      return res.status(400).json({ message: "vendor_id and otp are required" });
    }

    // Fetch latest OTP
    const result = await pool.query(
      `SELECT * FROM vendor_schema.vendor_otp
       WHERE vendor_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [vendor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "OTP not found" });
    }

    const otpRecord = result.rows[0];

    // Check expiration
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check OTP match
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    //  UPDATE vendor approval status
    const update = await pool.query(
      `UPDATE vendor_schema.vendors
       SET is_approve = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, name, email, phone, is_approve`,  
      [vendor_id]
    );

    res.json({
      success: true,
      message: "OTP verified & vendor approved successfully",
      vendor: update.rows[0]
    });

  } catch (error) {
    console.error("verifyVendorOtp:", error.message);
    res.status(500).json({ error: error.message });
  }
};

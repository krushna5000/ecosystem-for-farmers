import express from 'express';
import db from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


router.get("/test", async (req, res) => {
  const users = await db.query("SELECT * FROM user_schema.users");
  console.log(users.rows);
  res.json({ success: true, users: users.rows });
});

router.post("/send-otp", async (req, res) => {
  console.log(req.body);
  try {
    const { phone_number, full_name } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: "phone_number is required"
      });
    }

    const userResult = await db.query(
      "SELECT * FROM user_schema.users WHERE phone_number=$1",
      [phone_number]
    );

    const userExists = userResult.rows.length > 0;

    // ✅ NEW USER MUST SEND NAME
    if (!userExists) {
      if (!full_name || full_name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Full name required for new user"
        }); // ❗ STOP OTP here
      }

      // ✅ Insert user after name provided
      await db.query(
        `INSERT INTO user_schema.users (full_name, phone_number, is_verified)
         VALUES ($1, $2, false)`,
        [full_name.trim(), phone_number]
      );
    }

    // ✅ Generate OTP only AFTER user exists
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      `INSERT INTO user_schema.otp_verifications (phone_number, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [phone_number, otp, expires_at]
    );

    console.log(`✅ OTP for ${phone_number}:`, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "phone_number and otp are required"
      });
    }

    const otpResult = await db.query(
      `SELECT * FROM user_schema.otp_verifications
       WHERE phone_number=$1 AND otp_code=$2 AND is_used=false AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [phone_number, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    const otpRow = otpResult.rows[0];

    // Mark OTP as used
    await db.query(`UPDATE user_schema.otp_verifications SET is_used = true WHERE id=$1`, [otpRow.id]);

    // Get or create user
    let userResult = await db.query(`SELECT * FROM user_schema.users WHERE phone_number=$1`, [phone_number]);
    let user;

    if (!userResult.rows.length) {
      // This shouldn't happen if send-otp inserted the user, but handle it
      const insert = await db.query(
        `INSERT INTO user_schema.users(phone_number, is_verified, created_at, updated_at)
         VALUES ($1, true, NOW(), NOW()) RETURNING *`,
        [phone_number]
      );
      user = insert.rows[0];
    } else {
      user = userResult.rows[0];
      if (!user.is_verified) {
        await db.query(`UPDATE user_schema.users SET is_verified=true, updated_at=NOW() WHERE id=$1`, [user.id]);
        user.is_verified = true;
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, phone_number: user.phone_number },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

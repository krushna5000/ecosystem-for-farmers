import { findUserByWhatsappNumber, registerWhatsappUser, normalizePhone } from "../../services/whatsapp/authService.js";
import { createOtp, findOtp, markOtpUsed } from "../../models/otpModel.js";
import { generateOTP } from "../../utils/otpUtils.js";

const checkUser = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ success: false, message: "phone_number is required" });
    }

    const user = await findUserByWhatsappNumber(phone_number);

    if (user) {
      return res.status(200).json({
        success: true,
        registered: true,
        message: "User is registered",
        user: {
          id: user.id,
          full_name: user.full_name,
          phone_number: user.phone_number,
        },
      });
    }

    const raw10 = normalizePhone(phone_number);
    const otp = generateOTP();
    await createOtp(raw10, otp);

    console.log(`WhatsApp Registration OTP for ${raw10}: ${otp}`);

    return res.status(200).json({
      success: true,
      registered: false,
      otp: otp,
      message: "User not registered, OTP generated for registration",
    });
  } catch (error) {
    console.error("WhatsApp checkUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const registerUser = async (req, res) => {
  try {
    const { phone_number, otp, full_name } = req.body;

    if (!phone_number || !otp) {
      return res.status(400).json({ success: false, message: "phone_number and otp are required" });
    }

    const raw10 = normalizePhone(phone_number);

    const otpRow = await findOtp(raw10, otp);
    if (!otpRow) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    await markOtpUsed(otpRow.id);

    const existingUser = await findUserByWhatsappNumber(phone_number);
    if (existingUser) {
      return res.status(200).json({
        success: true,
        message: "User already registered",
        user: {
          id: existingUser.id,
          full_name: existingUser.full_name,
          phone_number: existingUser.phone_number,
        },
      });
    }

    const user = await registerWhatsappUser(full_name || "WhatsApp User", raw10);

    return res.status(201).json({
      success: true,
      message: "User registered successfully via WhatsApp",
      user: {
        id: user.id,
        full_name: user.full_name,
        phone_number: user.phone_number,
      },
    });
  } catch (error) {
    console.error("WhatsApp registerUser Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default { checkUser, registerUser };

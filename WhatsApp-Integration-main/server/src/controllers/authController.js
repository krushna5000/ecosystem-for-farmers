import db from "../config/db.js";
import { createOtp, findOtp, markOtpUsed } from "../models/otpModel.js";
import { generateOTP } from "../utils/otpUtils.js";

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

// Check if user is registered — core logic from WebApp authController.checkUser
export const checkUser = async (phoneNumber) => {
    if (!phoneNumber) {
        throw new Error("phone_number is required");
    }

    const user = await findUserByWhatsappNumber(phoneNumber);

    if (user) {
        return {
            success: true,
            registered: true,
            message: "User is registered",
            user: {
                id: user.id,
                full_name: user.full_name,
                phone_number: user.phone_number,
            },
        };
    }

    const raw10 = normalizePhone(phoneNumber);
    const otp = generateOTP();
    await createOtp(raw10, otp);

    console.log(`WhatsApp Registration OTP for ${raw10}: ${otp}`);

    return {
        success: true,
        registered: false,
        otp: otp,
        message: "User not registered, OTP generated for registration",
    };
};

// Register user via OTP — core logic from WebApp authController.registerUser
export const registerUser = async (phoneNumber, otp, fullName) => {
    if (!phoneNumber || !otp) {
        throw new Error("phone_number and otp are required");
    }

    const raw10 = normalizePhone(phoneNumber);

    const otpRow = await findOtp(raw10, otp);
    if (!otpRow) {
        throw new Error("Invalid or expired OTP");
    }

    await markOtpUsed(otpRow.id);

    const existingUser = await findUserByWhatsappNumber(phoneNumber);
    if (existingUser) {
        return {
            success: true,
            message: "User already registered",
            user: {
                id: existingUser.id,
                full_name: existingUser.full_name,
                phone_number: existingUser.phone_number,
            },
        };
    }

    const user = await registerWhatsappUser(fullName || "WhatsApp User", raw10);

    return {
        success: true,
        message: "User registered successfully via WhatsApp",
        user: {
            id: user.id,
            full_name: user.full_name,
            phone_number: user.phone_number,
        },
    };
};

export { normalizePhone, findUserByWhatsappNumber, registerWhatsappUser };

// Module-private outbound mail for vendorAuth. Failures are reported as `{ success: false, error }`.
import { sendMail } from "../../utils/mailer.js";
import { env } from "../../config/env.js";

export const sendForgotPasswordEmail = async (email, resetToken) => {
  const resetLink = `${env.frontendUrls.vendor}/reset-password?token=${resetToken}`;

  try {
    const info = await sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your vendor account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
    });
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp) => {
  try {
    const info = await sendMail({
      to: email,
      subject: "Password Reset OTP",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset OTP</h2>
        <p>You requested a password reset for your vendor account.</p>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
    });
    return { success: true, messageId: info?.messageId };
  } catch (error) {
    console.error("OTP email send error:", error);
    return { success: false, error: error.message };
  }
};

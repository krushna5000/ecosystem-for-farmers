import transporter from './mailer.js';
import jwt from 'jsonwebtoken';

export const sendForgotPasswordEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;


  if (!transporter) {
    console.log('📧 DEVELOPMENT MODE - Password Reset Email:');
    console.log('To:', email);
    console.log('Subject: Password Reset Request');
    console.log('Reset URL:', resetLink);
    console.log('Token:', resetToken);
    console.log('--- Email would be sent in production ---');
    return { success: true, messageId: 'dev-mode-logged' };
  }

  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@yourapp.com',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your vendor account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Your App Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    console.log('📧 DEVELOPMENT MODE - OTP Email:');
    console.log('To:', email);
    console.log('Subject: Password Reset OTP');
    console.log('OTP:', otp);
    console.log('--- Email would be sent in production ---');
    return { success: true, messageId: 'dev-mode-logged', otp: otp };
  }

  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@yourapp.com',
    to: email,
    subject: 'Password Reset OTP',
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('OTP email send error:', error);
    return { success: false, error: error.message };
  }
};

export const generateResetToken = (vendor) => {
  return jwt.sign(
    { id: vendor.id, email: vendor.email, type: 'password_reset' },
    process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

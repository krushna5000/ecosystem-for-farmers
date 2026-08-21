import nodemailer from 'nodemailer';

const useConsoleEmail = process.env.USE_CONSOLE_EMAIL === 'true';

let transporter;

if (useConsoleEmail) {
  // Development mode 
  console.log('📧 Email service in development mode - emails will be logged to console');
  transporter = null; 
} else {
  // Production SMTP configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export default transporter;

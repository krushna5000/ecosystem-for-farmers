import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000, // 30 seconds - time to establish connection
  greetingTimeout: 10000,   // 10 seconds - time to receive greeting after connection
  socketTimeout: 30000,     // 30 seconds - time between data transfers
});

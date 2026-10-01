import { sendMail } from "../../../lib/mailer.js";
import { mailFrom } from "./mailFrom.js";

export const sendVerifyEmail = async (email, verifyLink) => {
  try {
    await sendMail({
      from: mailFrom(),
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
        <p>This link is valid for one time only.</p>
      `,
    });

    console.log(`Verification email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error.message);
    return false;
  }
};

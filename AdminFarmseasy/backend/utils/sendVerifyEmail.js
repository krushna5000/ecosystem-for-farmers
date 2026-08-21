import { mailTransporter } from "./mailTransporter.js";

export const sendVerifyEmail = async (email, verifyLink) => {
  try {
    await mailTransporter.sendMail({
      from: `"FARMSEASY TECH SOLUTIONS PRIVATE LIMITED" <${process.env.EMAIL_USER}>`,
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
    console.error(error.stack);
    return false;
  }
};
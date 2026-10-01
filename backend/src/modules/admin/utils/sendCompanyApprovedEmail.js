import { sendMail } from "../../../lib/mailer.js";
import { mailFrom } from "./mailFrom.js";

export const sendApprovedEmail = async (
  toEmail,
  name,
  loginEmail,
  role = "vendor"
) => {
  const roleText = role === "company" ? "Company" : "Vendor";

  try {
    await sendMail({
      from: mailFrom(),
      to: toEmail,
      subject: `${roleText} Registration Successful 🎉`,
      text: `
Hello ${name},

Your ${roleText} account has been successfully registered and approved.

Login Email: ${loginEmail}

You can now login to the platform using your credentials.

Thank you.
      `,
      html: `
      <div style="font-family: Arial, sans-serif; background:#f5f6fa; padding:30px;">
        <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          
          <h2 style="color:#2e7d32; text-align:center;">
            🎉 ${roleText} Registration Successful
          </h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Your <strong>${roleText}</strong> account has been 
            <span style="color:#2e7d32; font-weight:bold;">
              successfully registered and approved
            </span>.
          </p>

          <div style="background:#f1f8e9; padding:15px; border-radius:6px; margin:20px 0;">
            <p style="margin:0;">
              <strong>Login Email:</strong> ${loginEmail}
            </p>
          </div>

          <p style="text-align:center; font-size:15px; color:#444;">
            You can now login to the platform using your credentials.
          </p>

          <hr style="margin:30px 0;">

          <p style="font-size:13px; color:#777; text-align:center;">
            FARMSEASY TECH SOLUTIONS PRIVATE LIMITED<br>
            This is an automated email. Please do not reply.
          </p>

        </div>
      </div>
      `,
    });

    console.log(`${roleText} approval email sent to: ${toEmail}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${toEmail}:`, error.message);
    throw error;
  }
};

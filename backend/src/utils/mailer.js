import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const { mail } = env;

const configured = Boolean(mail.user && mail.pass);
const consoleOnly = mail.consoleOnly || !configured;

const transporter = consoleOnly
  ? null
  : nodemailer.createTransport({
      ...(mail.service
        ? { service: mail.service }
        : { host: mail.host || "smtp.gmail.com", port: mail.port, secure: mail.secure }),
      auth: { user: mail.user, pass: mail.pass },
      connectionTimeout: 30000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
    });

if (consoleOnly) {
  console.log("Mailer: no SMTP credentials / USE_CONSOLE_EMAIL=true — emails will be logged to the console");
}

/**
 * Send an email. In console mode the message is logged and a fake info object returned.
 * @param {{to: string, subject: string, html?: string, text?: string, from?: string}} message
 */
export async function sendMail({ to, subject, html, text, from }) {
  const sender = from || mail.from || mail.user || "no-reply@farmseasy.in";
  if (!transporter) {
    console.log(`[mail:console] to=${to} subject="${subject}"\n${text || html}`);
    return { messageId: "console", accepted: [to] };
  }
  return transporter.sendMail({ from: sender, to, subject, html, text });
}

export { transporter };

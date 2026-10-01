import { env } from "../../../config/env.js";

const SENDER_NAME = "FARMSEASY TECH SOLUTIONS PRIVATE LIMITED";

/** `"FARMSEASY ..." <address>`; undefined lets lib/mailer.js pick its default sender. */
export const mailFrom = () => {
  if (env.mail.from) return env.mail.from;
  if (env.mail.user) return `"${SENDER_NAME}" <${env.mail.user}>`;
  return undefined;
};

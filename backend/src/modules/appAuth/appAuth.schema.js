// Drizzle tables for the farmer-app auth flow (user_schema.users / otp_verifications) — re-exported from the
// canonical db/schema so every file in this module imports its tables from here.
export { users, otpVerifications } from "../../db/schema/index.js";

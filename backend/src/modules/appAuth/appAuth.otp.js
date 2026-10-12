// Module-private OTP helpers.

// 6-digit numeric code, as a string.
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// OTPs stay valid for 5 minutes.
export const OTP_TTL_MS = 5 * 60 * 1000;

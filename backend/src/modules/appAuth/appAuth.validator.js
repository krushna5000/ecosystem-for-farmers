import { checkedBody as checked } from "../../utils/appValidation.js";

// Messages are the legacy API texts — clients display them as-is. Each schema reports only the first
// failing rule, in the original order (see utils/appValidation.js).

const PHONE_REGEX = /^(?:\+91|91)?[6-9]\d{9}$/;
const NAME_REGEX = /^[A-Za-z ]+$/;
const LANGUAGES = ["English", "Hindi", "Marathi"];
const UPDATABLE_FIELDS = ["full_name", "language"];

const INVALID_PHONE = "Please provide a valid mobile number.";
const INVALID_NAME = "Full name should contain only letters and spaces";

export const registerSendOtpSchema = checked(({ phone_number, full_name }) => {
  if (!phone_number || !full_name?.trim()) return "phone_number and full_name are required";
  if (!PHONE_REGEX.test(phone_number)) return INVALID_PHONE;
  if (!NAME_REGEX.test(full_name.trim())) return INVALID_NAME;
});

export const registerVerifyOtpSchema = checked(({ phone_number, otp }) => {
  if (!phone_number || !otp) return "phone_number and otp are required";
});

export const loginSendOtpSchema = checked(({ phone_number }) => {
  if (!phone_number) return "phone_number is required";
  if (!PHONE_REGEX.test(phone_number)) return INVALID_PHONE;
});

export const loginVerifyOtpSchema = checked(({ phone_number, otp }) => {
  if (!phone_number || !otp) return "phone_number and otp are required";
  if (!PHONE_REGEX.test(phone_number)) return INVALID_PHONE;
});

export const updateProfileSchema = checked((body) => {
  const { full_name, language } = body;

  const unexpected = Object.keys(body).filter((key) => !UPDATABLE_FIELDS.includes(key));
  if (unexpected.length > 0) {
    return `Invalid fields: ${unexpected.join(", ")}. Only full_name and language can be updated.`;
  }

  if (full_name !== undefined) {
    if (typeof full_name !== "string" || full_name.trim().length === 0) return "Invalid full_name";
    if (!NAME_REGEX.test(full_name.trim())) return INVALID_NAME;
  }

  if (language !== undefined && !LANGUAGES.includes(language)) {
    return "Invalid language. Supported: English, Hindi, Marathi";
  }
});

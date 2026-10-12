import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
// The legacy handlers tested `!value`, so "required" means falsy (missing, null, "" ...), whatever the type.
const truthy = (message) => z.any().refine(Boolean, message);

const loginMessage = "Email & Password required";
export const loginSchema = z
  .object({
    email: truthy(loginMessage),
    password: truthy(loginMessage),
  })
  .passthrough();

export const forgotPasswordSchema = z
  .object({
    email: truthy("Email is required"),
  })
  .passthrough();

export const verifyOtpSchema = z
  .object({
    email: truthy("Email and OTP are required"),
    otp: truthy("Email and OTP are required"),
  })
  .passthrough();

// "required" first, then the mismatch — the same order the old handler checked them in
// (zod reports field issues before the object-level refinement, and validate() sends the first one).
const resetMessage = "Token, new password, and confirm password are required";
export const resetPasswordSchema = z
  .object({
    token: truthy(resetMessage),
    newPassword: truthy(resetMessage),
    confirmPassword: truthy(resetMessage),
  })
  .passthrough()
  .refine((body) => body.newPassword === body.confirmPassword, {
    message: "New password and confirm password do not match",
  });

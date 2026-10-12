// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as adminVendorOtpService from "./adminVendorOtp.service.js";
import { sendJson } from "../../utils/response.js";

export async function sendVendorOtp(req, res) {
  const { otp, expiresAt } = await adminVendorOtpService.sendVendorOtp(req.body);
  sendJson(res, {
    success: true,
    message: "OTP sent successfully",
    otp, // REMOVE in production
    expires_at: expiresAt,
  });
}

export async function verifyVendorOtp(req, res) {
  const vendor = await adminVendorOtpService.verifyVendorOtp(req.body);
  sendJson(res, {
    success: true,
    message: "OTP verified & vendor approved successfully",
    vendor: vendor ?? undefined,
  });
}

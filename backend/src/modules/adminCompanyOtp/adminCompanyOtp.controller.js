// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as adminCompanyOtpService from "./adminCompanyOtp.service.js";
import { sendJson } from "../../utils/response.js";

export async function sendOtpToCompany(req, res) {
  const { otp, expiresAt } = await adminCompanyOtpService.sendOtpToCompany(req.body);
  sendJson(res, {
    success: true,
    message: "OTP sent successfully",
    otp, // remove in production
    expires_at: expiresAt,
  });
}

export async function verifyCompanyOtp(req, res) {
  const company = await adminCompanyOtpService.verifyCompanyOtp(req.body);
  sendJson(res, {
    success: true,
    message: "OTP verified & company approved successfully",
    company: company ?? undefined,
  });
}

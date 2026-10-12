// Thin HTTP layer: take the validated request, call the service, send the response. No try/catch —
// Express 5 forwards rejected promises to middleware/errorHandler.js.
import * as companyAuthService from "./companyAuth.service.js";
import { sendJson } from "../../utils/response.js";
import { snakeKeys } from "../../utils/rowCase.js";

const COOKIE_NAME = "company_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // true in production with HTTPS
  sameSite: "lax",
};

// Every body here is a legacy contract (`{ message }`, a bare profile row, ...), so all go through sendJson.
export async function companyLogin(req, res) {
  const token = await companyAuthService.loginCompany(req.body);

  // Save token in HTTP-Only Cookie
  res.cookie(COOKIE_NAME, token, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
  sendJson(res, { message: "Login successful" });
}

export async function updatePassword(req, res) {
  await companyAuthService.updateCompanyPassword(req.company.id, req.body);
  sendJson(res, { message: "Password updated successfully" });
}

export async function getCompanyProfile(req, res) {
  const company = await companyAuthService.getCompanyProfile(req.company.id);
  // A token whose company no longer exists has always answered 200 with an empty body.
  sendJson(res, company ? snakeKeys(company) : undefined);
}

export function companyLogout(req, res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  sendJson(res, { success: true, message: "Logout successful" });
}

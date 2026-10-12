import jwt from "jsonwebtoken";
import { portalSecret } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/index.js";

// Auth failures always answer `{ success: false, message }`, whatever style the module speaks.
const unauthorized = (message) =>
  new UnauthorizedError(message, { body: { success: false, message } });

export const authenticateVendor = (req, res, next) => {
  const token =
    req.cookies?.vendor_access_token || req.headers.authorization?.replace("Bearer ", "");

  if (!token) return next(unauthorized("Unauthorized"));

  try {
    req.vendor = jwt.verify(token, portalSecret("vendor"));
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};

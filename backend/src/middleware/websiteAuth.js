import jwt from "jsonwebtoken";
import { portalSecret } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/index.js";

// Auth failures always answer `{ success: false, message }`.
const unauthorized = (message) =>
  new UnauthorizedError(message, { body: { success: false, message } });

// Website CMS admin session: JWT in the `website_admin_token` cookie, signed with the website portal secret.
export const authenticateWebsiteAdmin = (req, res, next) => {
  const token = req.cookies?.website_admin_token;

  if (!token) return next(unauthorized("Unauthorized - No token provided"));

  try {
    req.user = jwt.verify(token, portalSecret("website"));
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};

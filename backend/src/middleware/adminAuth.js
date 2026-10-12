import jwt from "jsonwebtoken";
import { portalSecret } from "../utils/jwt.js";
import { UnauthorizedError } from "../errors/index.js";

// Admin auth failures answer `{ message }` (no `success` flag), whatever style the router speaks.
const unauthorized = (message) => new UnauthorizedError(message, { body: { message } });

export const adminAuth = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) return next(unauthorized("Not authenticated"));

  try {
    req.admin = jwt.verify(token, portalSecret("admin"));
    next();
  } catch {
    next(unauthorized("Invalid or expired token"));
  }
};

import jwt from "jsonwebtoken";
import { portalSecret } from "../utils/jwt.js";
import { ForbiddenError, UnauthorizedError } from "../errors/index.js";

// The company portal answers auth failures with a bare `{ message }` (no success flag), whatever
// style the module speaks — so the body is pinned.
export const verifyCompanyToken = (req, res, next) => {
  const token = req.cookies?.company_token;

  if (!token) {
    const message = "Unauthorized. Login first.";
    return next(new UnauthorizedError(message, { body: { message } }));
  }

  try {
    const decoded = jwt.verify(token, portalSecret("company"));
    req.company = decoded;
    next();
  } catch {
    const message = "Invalid or expired token";
    next(new ForbiddenError(message, { body: { message } }));
  }
};

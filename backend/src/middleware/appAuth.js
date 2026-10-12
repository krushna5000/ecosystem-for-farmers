// Farmer-app auth middleware + small request guards. Failures are pinned to the exact legacy
// `{ success: false, message }` bodies (the farmer app has always answered that shape, whatever the router style).
import { authenticateToken } from "../modules/appAuth/appAuth.service.js";
import { BadRequestError } from "../errors/index.js";

// Token from the cookie (web apps) or the Authorization header (mobile/native apps):
// "Bearer <token>" or just "<token>".
const tokenFrom = (req) => {
  if (req.cookies && req.cookies.token) return req.cookies.token;

  const authHeader = req.headers.authorization;
  if (authHeader) return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

  return undefined;
};

// Express 5 forwards a rejected promise to errorHandler, so no try/catch.
export const authenticateApp = async (req, res, next) => {
  req.user = await authenticateToken(tokenFrom(req));
  next();
};

export const detectUserType = (req, res, next) => {
  const clientType = req.headers["x-user-type"];
  // default is app
  req.detectedUserType = clientType === "webapp" ? "webapp" : "app";
  next();
};

export const validateFieldRequest = (req, res, next) => {
  const fieldId = req.params.fieldId || req.body?.FieldID;

  if (!fieldId) {
    const message = "Missing 'fieldId' parameter.";
    return next(new BadRequestError(message, { body: { success: false, message } }));
  }
  next();
};

import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Read token from cookie
  const token = req.cookies.token;

  // console.log("Auth Middleware - Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user id to request
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
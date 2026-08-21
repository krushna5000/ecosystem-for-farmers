import jwt from "jsonwebtoken";

export const authenticateVendor = (req, res, next) => {
  const token = req.cookies.vendor_access_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendor = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

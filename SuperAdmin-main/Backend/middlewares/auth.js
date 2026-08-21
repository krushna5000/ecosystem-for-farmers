import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const superAdminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin")
      return res.status(403).json({ message: "Only Super Admin allowed" });
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

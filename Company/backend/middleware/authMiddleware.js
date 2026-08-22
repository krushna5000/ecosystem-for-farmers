import jwt from "jsonwebtoken";

export const verifyCompanyToken = (req, res, next) => {
  const token = req.cookies.company_token;

  if (!token)
    return res.status(401).json({ message: "Unauthorized. Login first." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.company = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
  
};


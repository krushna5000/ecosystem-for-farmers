import jwt from "jsonwebtoken";

export const generateAccessToken = (vendor) => {
  return jwt.sign(
    {
      id: vendor.id,
      email: vendor.email,
      role: "vendor",
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

//refresh token 
export const generateRefreshToken = (vendor) => {
  return jwt.sign(
    {
      id: vendor.id,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};



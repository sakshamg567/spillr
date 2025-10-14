import jwt from "jsonwebtoken";
import User from "../models/User.js";


const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    throw new Error("JWT_SECRET is not configured");
  }

  return JWT_SECRET;
};

const getCookieConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? "none" : "lax", 
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

   
    const JWT_SECRET = getJWTSecret();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.clearCookie("token", getCookieConfig());
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.clearCookie("token", getCookieConfig());
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
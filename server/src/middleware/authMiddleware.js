import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
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
  };
};

const authMiddleware = async (req, res, next) => {
  try {
    console.log(' Auth check - cookies:', Object.keys(req.cookies || {}));
    console.log(' Cookie header:', req.headers.cookie ? 'present' : 'missing');
    
    const token = req.cookies?.token;
    
    if (!token) {
      console.log(' No token found in cookies');
      return res.status(401).json({ message: "Not authenticated" });
    }

    const JWT_SECRET = getJWTSecret();
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log(' Token decoded:', { userId: decoded.id });
    
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      console.log(' User not found or inactive');
      res.clearCookie("token", getCookieConfig());
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    console.log(' Auth successful for user:', user.email);
    next();
  } catch (error) {
    console.error(" Token verification error:", error.message);
    res.clearCookie("token", getCookieConfig());
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Don't access JWT_SECRET at module load time - lazy load it instead
const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables");
    throw new Error("JWT_SECRET is not configured");
  }
  
  return JWT_SECRET;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get JWT_SECRET at runtime, not at module load time
    const JWT_SECRET = getJWTSecret();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
      });
      return res.status(401).json({ message: "Invalid user" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import passport from "../config/passport.js";
import rateLimit from "express-rate-limit";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_SECRET 
 || process.env.JWT_SECRET 
.length < 20) {
  console.error(" JWT_SECRET must be at least 20 characters long");
  process.exit(1);
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes per IP
  message: { message: "Too many authentication attempts, try again later" },
  skipSuccessfulRequests: true
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePassword = (password) => {
  return password && 
         typeof password === 'string' &&
         password.length >= 8 && 
         password.length <= 128 &&
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

const validateName = (name) => {
  return name && 
         typeof name === 'string' && 
         name.trim().length >= 2 && 
         name.trim().length <= 50;
};


router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name: rawName, email: rawEmail, password } = req.body;
    const name = rawName?.trim();
    const email = rawEmail?.trim();

    if (!validateName(name)) {
      return res.status(400).json({ 
        message: "Name must be 2-50 characters long" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be 8-128 characters with uppercase, lowercase, and number" 
      });
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    const token = jwt.sign(
      { id: newUser._id, email: normalizedEmail }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, name, email: normalizedEmail },
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.trim();

    if (!validateEmail(email) || !password) {
      return res.status(400).json({ message: "Valid email and password required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    
    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    if (!user.passwordHash) {
      return res.status(400).json({ 
        message: "Please login with Google or reset your password" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: normalizedEmail }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );
   
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: normalizedEmail },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));


router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
      }
      
      if (!user) {
        console.error("No user returned from Google OAuth:", info);
        return res.redirect(`${frontendUrl}/login?error=no_user`);
      }
      
      // Log in the user
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error after OAuth:", loginErr);
          return res.redirect(`${frontendUrl}/login?error=login_failed`);
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
        
        res.redirect(`${frontendUrl}/dashboard?token=${token}`);
      });
    })(req, res, next);
  }
);

export default router;

import crypto from "crypto";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import Wall from "../models/Wall.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

const getJWTSecret = () => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET || JWT_SECRET.length < 20) {
    console.error("JWT_SECRET must be at least 20 characters long");
    console.error("Current JWT_SECRET length:", JWT_SECRET?.length || 0);
    throw new Error("Invalid JWT_SECRET configuration");
  }

  return JWT_SECRET;
};

const getCookieConfig = () => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    domain: isProduction ? undefined : undefined
  };
};
const setTokenCookie = (res, token) => {
   const config = getCookieConfig();
  console.log(' Setting cookie with config:', {
    ...config,
    token: token ? 'PRESENT' : 'MISSING'
  });
  res.cookie("token", token, config);
};

const authLimiter = rateLimit({
  windowMs:60 * 1000,
  max: 100,
  message: { message: "Too many authentication attempts, try again later" },
  skipSuccessfulRequests: true,
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validateUsername = (username) => {
  return (
    username &&
    typeof username === "string" &&
    username.trim().length >= 3 &&
    username.trim().length <= 30 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
};

const validatePassword = (password) => {
  return (
    password &&
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 128 &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  );
};

const validateName = (name) => {
  return (
    name &&
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 50
  );
};

const generateUniqueSlug = async (baseSlug, maxAttempts = 10) => {
  let slug = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 20);

  if (!slug || slug.length < 3) {
    slug = `user${Date.now()}`.substring(0, 15);
  }

  for (let i = 0; i < maxAttempts; i++) {
    const uniqueSlug = i === 0 ? slug : `${slug}${i}`;
    const exists = await Wall.findOne({ slug: uniqueSlug });
    if (!exists) return uniqueSlug;
  }
  return `${slug}${Date.now()}`.substring(0, 30);
};


const createWallForUser = async (userId, username, name) => {
  try {
    const existingWall = await Wall.findOne({ ownerId: userId });
    if (existingWall) {
      console.log(`Wall already exists for user ${userId}: ${existingWall.slug}`);
      return { success: true, wall: existingWall, alreadyExists: true };
    }

    const slug = await generateUniqueSlug(username);
    
    const wall = await Wall.create({
      ownerId: userId,
      username: username,
      slug: slug,
    });
    
    console.log(`✓ Wall created successfully for user ${userId}: ${slug}`);
    return { success: true, wall };
  } catch (error) {
    console.error('Failed to create wall:', error);
    return { 
      success: false, 
      error: error.message,
    };
  }
};

// Health check route
router.get("/health", (req, res) => {
  try {
    const JWT_SECRET = getJWTSecret();
    res.json({
      status: "ok",
      jwt_configured: !!JWT_SECRET,
      message: "Auth service is running",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
     const user = await User.findById(req.user._id)
      .select('-passwordHash -googleId -resetPasswordToken -resetPasswordExpires')
      .lean();
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      username: req.user.username,
    });
  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", authLimiter, async (req, res) => {
  try {
    const {
      name: rawName,
      email: rawEmail,
      password,
      username: rawUsername,
    } = req.body;
    const name = rawName?.trim();
    const email = rawEmail?.trim();
    const username = rawUsername?.trim();

    if (!validateName(name)) {
      return res
        .status(400)
        .json({ message: "Name must be 2-50 characters long" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!validateUsername(username)) {
      return res
        .status(400)
        .json({ message: "Username must be 3-30 characters..." });
    }
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({ message: "Password must be 8-128 characters..." });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: "Email already in use" });
      } else {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
    });
let wallResult = { success: false };
    const maxWallAttempts = 3;
    
    for (let attempt = 1; attempt <= maxWallAttempts; attempt++) {
      try {
        console.log(` Wall creation attempt ${attempt}/${maxWallAttempts}`);
        wallResult = await createWallForUser(newUser._id, normalizedUsername, name);
        
        if (wallResult.success) {
          console.log(' Wall created successfully');
          break;
        }
        
        if (attempt < maxWallAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
        }
      } catch (wallError) {
        console.error(` Wall creation attempt ${attempt} failed:`, wallError.message);
        if (attempt === maxWallAttempts) {
          console.error(' All wall creation attempts failed');
        }
      }
    }


    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      { id: newUser._id, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    setTokenCookie(res, token);
    
    res.status(201).json({
      success: true,
      userCreated: true,
      wallCreated: wallResult?.success || false,
      message: "Registration successful",
      user: {
        id: newUser._id,
        name,
        email: normalizedEmail,
        username: normalizedUsername,
      },
      slug: wallResult?.wall?.slug || null,
    });
 } catch (err) {
    console.error(" Registration error:", err);
if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
    
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
    

    const user = await User.findOne({ email: normalizedEmail })
      .select("+passwordHash")
      .lean(); 

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: "Please reset your password",
      });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('Password comparison result:', isMatch);
    } catch (compareError) {
      console.error(' Password comparison error:', compareError);
      return res.status(500).json({ message: "Authentication error" });
    }

    if (!isMatch) {
      console.log(' Password mismatch for:', normalizedEmail);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      { id: user._id, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: normalizedEmail,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(" Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});


router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailContent = {
      to: user.email,
      subject: "Password Reset Request - Spillr",
      text: `Click this link to reset your password: ${resetURL}`,
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetURL}">${resetURL}</a>
        <p>This link expires in 1 hour.</p>
      `
    };

    const emailResult = await sendEmail(mailContent);
    
    if (emailResult.success) {
      res.status(200).json({ message: "Reset link sent to your email" });
    } else {
      res.status(500).json({ message: "Failed to send reset email. Please try again." });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      message: "Password reset successful",
      token: authToken,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/verify-reset-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    res.status(200).json({ email: user.email });
  } catch (err) {
    console.error("Verify reset token error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/logout", (req, res) => {
  const config = getCookieConfig();
  res.clearCookie("token", config);
  console.log(' User logged out');
  res.status(200).json({ message: "Logged out successfully" });
});

router.get("/debug-auth", authMiddleware, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      username: req.user.username
    },
    cookies: Object.keys(req.cookies || {}),
    hasCookie: !!req.cookies?.token
  });
});

router.get("/debug-cors", (req, res) => {
  res.json({
    origin: req.headers.origin,
    cookies: req.headers.cookie,
    allowedOrigins: process.env.FRONTEND_URL,
    nodeEnv: process.env.NODE_ENV
  });
});

export default router;

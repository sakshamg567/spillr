import express from "express";
import rateLimit from "express-rate-limit";
import Wall from "../models/Wall.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Predefined themes
const availableThemes = [
  "default",
  "dark",
  "light",
  "colorful",
  "minimal",
  "ocean",
  "forest",
  "sunset",
];

// Rate limiter for theme updates
const themeUpdateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many theme updates. Try again later." },
});

// API info
router.get("/", (req, res) => {
  res.json({
    message: "Wall API is working!",
    endpoints: {
      "GET /api/wall/:slug": "Get wall by slug",
      "POST /api/wall": "Create wall (requires authentication)",
      "PATCH /api/wall/:slug/theme": "Update wall theme (requires authentication)",
      "GET /api/wall/themes/available": "Get list of available themes"
    },
    status: "healthy"
  });
});

// Create wall
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.body;

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return res.status(400).json({ message: "Slug is required and must be a non-empty string" });
    }

    const trimmedSlug = slug.trim().toLowerCase();
    if (trimmedSlug.length < 2) {
      return res.status(400).json({ message: "Slug must be at least 2 characters" });
    }

    const wallExists = await Wall.findOne({ slug: trimmedSlug });
    if (wallExists) {
      return res.status(400).json({ message: "Slug already taken" });
    }

    // Get user's username for the wall
    const user = await User.findById(req.user.id).select('username');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const wall = new Wall({
      ownerId: req.user.id,
      username: user.username,
      slug: trimmedSlug
    });

    await wall.save();
    res.status(201).json(wall);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get wall by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const slug = req.params.slug.trim();
    const wall = await Wall.findOne({ slug });

    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    res.json(wall);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get available themes
router.get("/themes/available", (req, res) => {
  res.json({ themes: availableThemes });
});

// Update wall theme
router.patch("/:slug/theme", authMiddleware, themeUpdateLimiter, async (req, res) => {
  try {
    const { theme, customColors } = req.body;
    const slug = req.params.slug.trim();
    const wall = await Wall.findOne({ slug });

    if (!wall) return res.status(404).json({ message: "Wall not found" });
    if (wall.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (theme) {
      if (!availableThemes.includes(theme)) {
        return res.status(400).json({ message: "Invalid theme selection" });
      }
      wall.theme = theme;
    }

    if (customColors) {
      Object.assign(wall.customColors, customColors);
    }

    await wall.save();
    res.json(wall);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

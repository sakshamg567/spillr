import express from "express";
import Wall from "../models/Wall.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create wall 
 router.post("/", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.body;

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
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

    const wall = new Wall({
      ownerId: req.user.id, 
      slug: trimmedSlug
    });

    await wall.save();
    res.status(201).json(wall);
  } catch (err) {
    console.error("Error creating wall:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get wall by slug (public) 
router.get("/:slug", async (req, res) => {
  try {
    const { slug: rawSlug } = req.params;
    const slug = rawSlug.trim();
    const wall = await Wall.findOne({ slug });

    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    res.json(wall);
  } catch (err) {
    console.error(" Error fetching wall:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
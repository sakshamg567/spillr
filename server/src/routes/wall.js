import express from "express";
import Wall from "../models/Wall.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create wall 
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.body;

    const wallExists = await Wall.findOne({ slug });
    if (wallExists) return res.status(400).json({ message: "Slug already taken" });

    const wall = new Wall({ ownerId: req.user.id, slug });
    await wall.save();

    res.json(wall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get wall by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const wall = await Wall.findOne({ slug });
    if (!wall) return res.status(404).json({ message: "Wall not found" });

    res.json(wall);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

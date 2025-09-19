import express from "express";
import Feedback from '../models/feedback.js';
import Wall from "../models/Wall.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import validator from 'validator';
import mongoose from 'mongoose'

const router = express.Router();

// Submit feedback (public)

router.post("/", async (req, res) => {
  try {
    const { question, wallSlug } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ message: "Question is required" });
    }

    if (question.trim().length < 3) {
      return res.status(400).json({ message: "Question too short" });
    }

    if (question.length > 1000) {
      return res.status(400).json({ message: "Question too long" });
    }

    if (!wallSlug || typeof wallSlug !== 'string') {
      return res.status(400).json({ message: "Wall slug is required" });
    }

    const wall = await Wall.findOne({ slug: wallSlug.trim().toLowerCase() });
    if (!wall) return res.status(404).json({ message: "Wall not found" });

    const feedback = new Feedback({
      question: validator.escape(question.trim()), 
      wallId: wall._id
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    console.error("Error submitting feedback:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get feedback for owner (private)

router.get('/owner/:wallId', authMiddleware, async (req, res) => {
  try {
    const wallId = req.params.wallId;

    //Verify wall ownership
    const wall = await Wall.findById(wallId);
    if (!wall) return res.status(404).json({ message: "Wall not found" });
    if (wall.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //Sorting + filtering
    const { sort = 'active',page = 1 , limit =10  } = req.query;  
    const pageNumber = Math.max(1,parseInt(page,10));
    const limitNumber = Math.min(100,parseInt(limit,10));
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { wallId: mongoose.Types.ObjectId(wallId)};
    let sortOption = { createdAt: -1 };

    switch (sort) {
      case 'answered':
        filter.isAnswered = true;
        filter.isArchived = false;
        sortOption = { updatedAt: -1 }; // newest answers first
        break;

      case 'archived':
        filter.isArchived = true;
        sortOption = { updatedAt: -1 };
        break;

      case 'active':
      default:
        filter.isAnswered = false;
        filter.isArchived = false;
        sortOption = { createdAt: -1 }; // newest questions first
        break;
    }

    // Fetch feedback
    const feedbacks = await Feedback.find(filter)
                                   .sort(sortOption)
                                   .skip(skip)
                                   .limit(limitNumber)
                                   .lean();
    //get total count for pagination 
    const totalFeedbacks = await Feedback.countDocuments(filter);
 
    res.json({
      feedbacks,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalFeedbacks / limitNumber),
        totalFeedbacks,
        hasNextPage: pageNumber < Math.ceil(totalFeedbacks / limitNumber),
        hasPrevPage: pageNumber > 1,
        
      }
    });

  } catch (err) {
    console.error("Error fetching feedback:", err);

    if (err instanceof mongoose.Error.CastError && err.path === 'wallId') {
       return res.status(400).json({ message: "Invalid wall ID format" });
    }
    res.status(500).json({ message: "Internal server error" }); 
  }
});

// Answer feedback
router.post('/:id/answer', authMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) return res.status(404).json({ message: "Feedback not found" }); 

    const wall = await Wall.findById(feedback.wallId);
     
    if(!wall) return res.status(404).json({message:"Wall not found"});

    if (wall.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to answer this feedback" });
    }

    feedback.answer = answer;
    feedback.isAnswered = true;
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    
    res.status(500).json({ message: err.message });
  }
});

// React to feedback (public)
router.post("/:id/react", async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: "Emoji required" });

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    const current = feedback.reactions.get(emoji) || 0;
    feedback.reactions.set(emoji, current + 1);

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Public: get answered feedback for a wall
router.get("/wall/:slug", async (req, res) => {
  try {
    const wall = await Wall.findOne({ slug: req.params.slug });
    if (!wall) return res.status(404).json({ message: "Wall not found" });

    const feedbacks = await Feedback.find({ wallId: wall._id, isAnswered: true });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
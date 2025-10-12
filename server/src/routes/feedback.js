import express from "express";
import Feedback from "../models/Feedback.js";
import Wall from "../models/Wall.js";
import authMiddleware from "../middleware/authMiddleware.js";

import validator from "validator";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

const router = express.Router();

const feedbackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 feedback per 5 minutes
  message: { message: "Too many feedback submissions, please try again later" },
});

const validateQuestion = (question) => {
  if (!question || typeof question !== "string") return false;
  const trimmed = question.trim();
  return trimmed.length >= 3 && trimmed.length <= 1000;
};

const validateSlug = (slug) => {
  if (!slug || typeof slug !== "string") return false;
  const trimmed = slug.trim();
  return (
    trimmed.length >= 2 &&
    trimmed.length <= 50 &&
    /^[a-zA-Z0-9_-]+$/.test(trimmed)
  );
};

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket && req.socket.remoteAddress
    ? req.socket.remoteAddress
    : "unknown";
};

router.get("/", (req, res) => {
  console.log("GET /api/feedback hit - Feedback API info");
  res.json({
    message: "Feedback API is working!",
    endpoints: {
      "POST /api/feedback": "Submit feedback",
      "GET /api/feedback/wall/:slug": "Get public feedback for wall",
      "POST /api/feedback/:id/react": "React to feedback",
    },
    status: "healthy",
  });
});

// Submit feedback (public)

router.post("/", feedbackLimiter, async (req, res) => {
  try {
    const { question: rawQuestion, wallSlug: rawSlug } = req.body;
    const question = rawQuestion?.trim();
    const wallSlug = rawSlug?.trim()?.toLowerCase();

    if (!validateQuestion(question)) {
      return res.status(400).json({
        message: "Question must be between 3-1000 characters",
      });
    }

    if (!validateSlug(wallSlug)) {
      return res.status(400).json({ message: "Invalid wall slug format" });
    }

    const wall = await Wall.findOne({ slug: wallSlug }).populate("ownerId");

    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    const submitterIP = getClientIP(req);

    if (wall.ownerId?.blockedIps?.includes(submitterIP)) {
      return res.status(403).json({
        message: "You are blocked from submitting feedback to this wall.",
      });
    }
  
    if (req.user && Array.isArray(wall.ownerId.blockedUsers)) {
      const isBlocked = wall.ownerId.blockedUsers.some(
        (id) => id.toString() === req.user.id
      );
      if (isBlocked) {
        return res
          .status(403)
          .json({
            message: "You are blocked from submitting feedback to this wall",
          });
      }
    
    }

    const feedback = new Feedback({
      question: validator.escape(question),
      wallId: wall._id,
      userId: req.user?.id || null,
      ipAddress: submitterIP,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Unable to submit feedback" });
  }
});

// Get feedback for owner
router.get("/owner/:slug", authMiddleware, async (req, res) => {
  try {
    const slug = req.params.slug.trim().toLowerCase();

    const wall = await Wall.findOne({ slug });
    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    if (wall.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { sort = "active", page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, parseInt(page, 10)) || 1;
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10))) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let filter = { wallId: wall._id };

    let sortOption = { createdAt: -1 };

    switch (sort) {
      case "answered":
        filter.isAnswered = true;
        filter.isArchived = false;
        sortOption = { updatedAt: -1 };
        break;
      case "archived":
        filter.isArchived = true;
        sortOption = { updatedAt: -1 };
        break;
      case "active":
      default:
        filter.isAnswered = false;
        filter.isArchived = false;
        sortOption = { createdAt: -1 };
        break;
    }

    const [feedbacks, totalFeedbacks] = await Promise.all([
      Feedback.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Feedback.countDocuments(filter),
    ]);

    const answeredCount = await Feedback.countDocuments({
      wallId: wall._id,
      isAnswered: true,
    });
    const archivedCount = await Feedback.countDocuments({
      wallId: wall._id,
      isArchived: true,
    });
    const totalCount = await Feedback.countDocuments({ wallId: wall._id });
    const activeCount = await Feedback.countDocuments({
  wallId: wall._id,
  isAnswered: false,
  isArchived: false,
});
    const answerRate = totalCount
      ? Math.round((answeredCount / totalCount) * 100)
      : 0;

    res.json({
      feedbacks,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalFeedbacks / limitNumber),
        totalFeedbacks,
        hasNextPage: pageNumber < Math.ceil(totalFeedbacks / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
      stats: {
        total: totalCount,
        answered: answeredCount,
        archived: archivedCount,
        active: activeCount,
        answerRate,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch feedback" });
  }
});

router.post("/:id/answer", authMiddleware, async (req, res) => {
  try {
    const { answer: rawAnswer } = req.body;
    const answer = rawAnswer?.trim();

    if (!answer || answer.length < 1 || answer.length > 2000) {
      return res.status(400).json({
        message: "Answer must be between 1-2000 characters",
      });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid feedback ID format" });
    }

    const feedback = await Feedback.findById(req.params.id).populate("wallId");
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (!feedback.wallId) {
      return res.status(404).json({ message: "Associated wall not found" });
    }

    if (feedback.wallId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Not authorized to answer this feedback",
      });
    }

    feedback.answer = validator.escape(answer);
    feedback.isAnswered = true;
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Unable to answer feedback" });
  }
});

const reactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 reactions per minute
  message: { message: "Too many reactions, slow down" },
});

router.post("/:id/react", reactLimiter, async (req, res) => {
  try {
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string" || emoji.length > 10) {
      return res.status(400).json({ message: "Invalid emoji" });
    }

    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid feedback ID format" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const current = feedback.reactions.get(emoji) || 0;

    if (current >= 1000) {
      return res
        .status(400)
        .json({ message: "Maximum reactions reached for this emoji" });
    }

    feedback.reactions.set(emoji, current + 1);
    await feedback.save();

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: "Unable to add reaction" });
  }
});

//  Public feedback with validation
router.get("/wall/:slug", async (req, res) => {
  try {
    const { slug: rawSlug } = req.params;
    const slug = rawSlug?.trim()?.toLowerCase();

    if (!validateSlug(slug)) {
      return res.status(400).json({ message: "Invalid wall slug format" });
    }

    const wall = await Wall.findOne({ slug });
    if (!wall) {
      return res.status(404).json({ message: "Wall not found" });
    }

    const feedbacks = await Feedback.find({
      wallId: wall._id,
      isAnswered: true,
      isArchived: false,
    })
      .select("-__v -updatedAt")
      .sort({ updatedAt: -1 })
      .limit(100); // Prevent large responses

    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch feedback" });
  }
});

router.patch("/:id/archive", authMiddleware, async (req, res) => {
  try {
    const { archived = true } = req.body;

    const feedback = await Feedback.findById(req.params.id).populate("wallId");
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    if (feedback.wallId.ownerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    feedback.isArchived = archived;
    await feedback.save();

    res.json({
      message: archived ? "Feedback archived" : "Feedback unarchived",
    });
  } catch (err) {
    console.error("Archive feedback error:", err);
    res.status(500).json({ message: "Unable to update archive status" });
  }
});

export default router;

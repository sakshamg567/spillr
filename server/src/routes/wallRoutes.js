import express from "express";
import { getPublicWall, getPublicFeedback } from "../controllers/wallController.js";

const router = express.Router();

router.get("/:slug", getPublicWall);
router.get("/:slug/feedbacks", getPublicFeedback);

export default router;

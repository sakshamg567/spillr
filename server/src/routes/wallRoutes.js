import express from "express";
import { getPublicWall, getPublicFeedback } from "../controllers/wallController.js";

const router = express.Router();

router.get("/:slug/feedbacks", getPublicFeedback);
router.get("/:slug", getPublicWall);


export default router;

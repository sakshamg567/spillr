import express from "express";
import Wall from "../models/Wall.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import { getPublicWall } from '../controllers/wallController.js';
const router = express.Router();

router.get('/:username', getPublicWall);


export default router;

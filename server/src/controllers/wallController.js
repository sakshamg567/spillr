import Wall from "../models/Wall.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";


const generateUniqueSlug = async (baseSlug) => {
  let slug = baseSlug.toLowerCase();
  
 
  if (!slug || slug.length < 3) {
    slug = `user${Date.now()}`.substring(0, 15);
  }
  
  let counter = 1;
  let uniqueSlug = slug;
  

  while (await Wall.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};


export const createWallForUser = async (userId, username, name) => {
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
      title: `${name}'s Wall`,
      description: 'Share your thoughts anonymously!',
      isActive: true,
      theme: 'light',
      customColors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#3b82f6',
      },
    });
    
    console.log(`Wall created successfully for user ${userId}: ${slug}`);
    return { success: true, wall };
  } catch (error) {
    console.error('Failed to create wall:', error);
    return { 
      success: false, 
      error: error.message,
      userCreated: true 
    };
  }
};

export const getPublicWall = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ error: "Slug required" });
  }

  try {
    const wall = await Wall.findOne({ slug: slug.toLowerCase() })
      .populate("ownerId", "name username bio profilePicture socialLinks")
      .select("slug customColors theme")
      .lean();
    
    if (!wall) {
      return res.status(404).json({ error: "Wall not found" });
    }


    if (!wall.ownerId) {
      return res.status(404).json({ error: "Wall owner not found" });
    }

    const publicWallData = {
      name: wall.ownerId.name,
      username: wall.ownerId.username,
      bio: wall.ownerId.bio || '',
      profilePicture: wall.ownerId.profilePicture || null,
      socialLinks: wall.ownerId.socialLinks || [],
      slug: wall.slug,
      customColors: wall.customColors || {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#3b82f6',
      },
      theme: wall.theme || 'light',
    };

    res.json(publicWallData);
  } catch (err) {
    console.error("Get public wall error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPublicFeedback = async (req, res) => {
  const { slug } = req.params;
  
  try {
    let wall = await Wall.findOne({ slug: slug.toLowerCase() })
      .select("_id")
      .lean();

    if (!wall) {
      return res.status(404).json({ error: "Wall not found" });
    }

    const feedbacks = await Feedback.find({
      wallId: wall._id,
      isAnswered: true,
      isArchived: false,
    })
      .select("question answer reactions createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.json({ feedbacks });
  } catch (err) {
    console.error("Get public feedback error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const submitFeedback = async (req, res) => {
  const { slug } = req.params;
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const wall = await Wall.findOne({ slug: slug.toLowerCase() });

    if (!wall) {
      return res.status(404).json({ error: "Wall not found" });
    }

    if (!wall.isActive) {
      return res.status(403).json({ error: "This wall is not accepting feedback" });
    }

    const feedback = await Feedback.create({
      wallId: wall._id,
      question: question.trim(),
      isAnswered: false,
      isArchived: false,
      reactions: [],
    });

    res.status(201).json({ 
      success: true, 
      message: "Feedback submitted successfully",
      feedbackId: feedback._id 
    });
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};

export default {
  createWallForUser,
  getPublicWall,
  getPublicFeedback,
  submitFeedback,
};
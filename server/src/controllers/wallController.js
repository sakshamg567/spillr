import Wall from "../models/Wall.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";

export const getPublicWall = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
  

    const wall = await Wall.findOne({ slug: slug.toLowerCase() })
      .populate("ownerId", "name username bio profilePicture socialLinks")
      .select("slug customColors theme")
      .lean();
    
    if (!wall) {
      return res.status(404).json({ error: "Wall not found" });
    }

    const publicWallData = {
      name: wall.ownerId.name,
      username: wall.ownerId.username,
      bio: wall.ownerId.bio,
      profilePicture: wall.ownerId.profilePicture,
      socialLinks: wall.ownerId.socialLinks,
      slug: wall.slug,
      customColors: wall.customColors,
      theme: wall.theme,
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
    const wall = await Wall.findOne({ slug: slug.toLowerCase() })
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

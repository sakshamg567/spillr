import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import multer from "multer";
import crypto from "crypto";
import mongoose from "mongoose";
import validator from "validator";
import rateLimit from "express-rate-limit";
import { promisify } from "util";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { fileTypeFromBuffer } from "file-type";
import Wall from "../models/Wall.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const F_OK = fs.constants.F_OK;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, "..", "uploads");

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (!useCloudinary && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(" Using local file storage (Cloudinary not configured)");
  console.log("   Files will be lost on container restart!");
}

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many profile updates, please try again later" },
});

const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many password change attempts, please try again later",
  },
});

const accountDeletionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: {
    message: "Too many account deletion requests, please try again tomorrow",
  },
});

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validatePassword = (password) => {
  return (
    password &&
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 128 &&
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
  );
};
const validateName = (name) => {
  return (
    name &&
    typeof name === "string" &&
    name.trim().length >= 2 &&
    name.trim().length <= 50
  );
};

const validateUsername = (username) => {
  return (
    username &&
    typeof username === "string" &&
    username.trim().length >= 3 &&
    username.trim().length <= 30 &&
    /^[a-zA-Z0-9_]+$/.test(username)
  );
};
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .replace(/^\.+/, "")
    .substring(0, 100);
};

const validateFile = async (buffer) => {
  try {
    const type = await fileTypeFromBuffer(buffer);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 5 * 1024 * 1024;

    return (
      type &&
      allowedTypes.includes(type.mime) &&
      buffer.length <= maxSize &&
      buffer.length > 0
    );
  } catch (error) {
    console.error("File validation error:", error.message);
    return false;
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

const router = express.Router();
const ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS = 24;

const ERROR_MESSAGES = {
  INTERNAL_ERROR: "An error occurred. Please try again.",
  UNAUTHORIZED: "Access denied",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Invalid input provided",
  USER_NOT_FOUND: "User not found or inactive",
};
const deleteOldProfilePicture = async (oldProfilePicture) => {
  if (!oldProfilePicture) return;
  if (oldProfilePicture.includes("cloudinary.com")) {
    try {
      const urlParts = oldProfilePicture.split("/upload/");
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1];
        const pathParts = pathAfterUpload.split("/");
        const fileWithExt = pathParts[pathParts.length - 1];
        const publicId = `spillr/profile-pictures/${fileWithExt.split(".")[0]}`;

        await cloudinary.uploader.destroy(publicId);
        console.log("Old Cloudinary image deleted:", publicId);
      }
    } catch (error) {
      console.error("Failed to delete old Cloudinary image:", error.message);
    }
  } else if (oldProfilePicture.startsWith("/uploads/")) {
    try {
      const oldFilePath = path.join(
        uploadDir,
        path.basename(oldProfilePicture)
      );
      await access(oldFilePath, F_OK);
      await unlink(oldFilePath);
      console.log("Old local file deleted");
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Failed to delete old local file:", error.message);
      }
    }
  }
};
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry"
    );

    if (!user || !user.isActive) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    const userObj = user.toObject();

    res.json(userObj);
  } catch (error) {
    console.error("Get user profile error:", error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});
router.patch(
  "/profile",
  authMiddleware,
  profileUpdateLimiter,
  async (req, res) => {
    try {
      const updates = req.body;
      const allowedUpdates = ["name", "username", "bio", "socialLinks"];
      const isValid = Object.keys(updates).every((key) =>
        allowedUpdates.includes(key)
      );

      if (!isValid) {
        return res
          .status(400)
          .json({ message: "Invalid field in update request" });
      }
      if (updates.name !== undefined) {
        if (!validateName(updates.name)) {
          return res
            .status(400)
            .json({ message: "Name must be 2-50 characters long" });
        }
        updates.name = validator.escape(updates.name.trim());
      }

      if (updates.username !== undefined) {
        const normalizedUsername = updates.username.trim().toLowerCase();

        if (!validateUsername(normalizedUsername)) {
          return res.status(400).json({
            message:
              "Username must be 3-30 characters with letters, numbers, and underscores",
          });
        }

        const existingUser = await User.findOne({
          username: normalizedUsername,
          _id: { $ne: req.user.id },
        });

        if (existingUser) {
          return res.status(400).json({ message: "Username already taken" });
        }

        updates.username = normalizedUsername;

        await Wall.updateOne(
          { ownerId: req.user.id },
          { $set: { username: normalizedUsername } }
        );
      }

      if (updates.bio !== undefined) {
        if (typeof updates.bio !== "string" || updates.bio.length > 500) {
          return res
            .status(400)
            .json({ message: "Bio must be a string with max 500 characters" });
        }
        updates.bio = validator.escape(updates.bio.trim());
      }

      if (updates.socialLinks !== undefined) {
        const { twitter, linkedin, website, instagram } = updates.socialLinks;

        if (twitter && !validator.isURL(twitter)) {
          return res.status(400).json({ message: "Invalid Twitter URL" });
        }
        if (linkedin && !validator.isURL(linkedin)) {
          return res.status(400).json({ message: "Invalid LinkedIn URL" });
        }
        if (website && !validator.isURL(website)) {
          return res.status(400).json({ message: "Invalid website URL" });
        }
        if (instagram && !validator.isURL(instagram)) {
          return res.status(400).json({ message: "Invalid Instagram URL" });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
          select:
            "-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry",
        }
      );

      if (!user) {
        return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      res.json(user);
    } catch (error) {
      console.error("Profile update error:", error.message);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({
          message: "Validation failed",
          errors: messages,
        });
      }

      res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
  }
);

router.patch(
  "/profile-picture",
  authMiddleware,
  profileUpdateLimiter,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const valid = await validateFile(req.file.buffer);
      if (!valid) {
        return res.status(400).json({ message: "Invalid file" });
      }

      let profilePictureUrl;

      if (useCloudinary || process.env.NODE_ENV === "production") {
        try {
          console.log(" Uploading to Cloudinary...");

          const currentUser = await User.findById(req.user.id).select(
            "profilePicture"
          );
          if (currentUser?.profilePicture?.includes("cloudinary.com")) {
            await deleteOldProfilePicture(currentUser.profilePicture);
          }
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "spillr/profile-pictures",
                public_id: `user-${req.user.id}-${Date.now()}`, 
                transformation: [
                  { width: 500, height: 500, crop: "fill", gravity: "face" },
                  { quality: "auto:good", fetch_format: "auto" },
                ],
                overwrite: true,
                resource_type: "image",
                invalidate: true, 
                access_mode: "public", 
              },
              (error, result) => {
                if (error) {
                  console.error(" Cloudinary upload error:", error);
                  reject(error);
                } else {
                  console.log(
                    " Cloudinary upload result:",
                    result.secure_url
                  );
                  resolve(result);
                }
              }
            );

            uploadStream.end(req.file.buffer);
          });

          profilePictureUrl = uploadResult.secure_url;
          console.log("New profile picture URL:", profilePictureUrl);
        } catch (cloudinaryError) {
          console.error("Cloudinary upload failed:", cloudinaryError);
          return res.status(500).json({
            message: "Failed to upload image. Please try again.",
          });
        }
      }

      if (!profilePictureUrl && process.env.NODE_ENV !== "production") {
        console.log(" Using local file storage (development only)");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const sanitizedOriginal = sanitizeFilename(req.file.originalname);
        const filename = `user-${req.user.id}-${uniqueSuffix}-${sanitizedOriginal}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, req.file.buffer);
        profilePictureUrl = `/uploads/${filename}`;
        console.log(" Saved locally:", filename);
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: profilePictureUrl },
        { new: true, runValidators: true }
      ).select("-passwordHash -googleId");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(" Database updated with new profile picture");

      res.json({
        message: "Profile picture updated successfully",
        profilePicture: profilePictureUrl,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          profilePicture: profilePictureUrl,
          bio: user.bio,
          socialLinks: user.socialLinks,
          emailNotifications: user.emailNotifications,
        },
      });
    } catch (error) {
      console.error("Profile picture upload error:", error.message);
      res.status(500).json({
        message: "Failed to upload profile picture. Please try again.",
      });
    }
  }
);

router.patch(
  "/notifications",
  authMiddleware,
  profileUpdateLimiter,
  async (req, res) => {
    try {
      const updates = req.body;

      if (!updates || typeof updates !== "object") {
        return res
          .status(400)
          .json({ message: "Invalid notification settings" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { emailNotifications: updates },
        {
          new: true,
          runValidators: true,
          select:
            "-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry",
        }
      );

      if (!user) {
        return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      res.json({ emailNotifications: user.emailNotifications });
    } catch (error) {
      console.error("Notification settings update error:", error.message);
      res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
  }
);

router.post(
  "/change-password",
  authMiddleware,
  passwordChangeLimiter,
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Both old and new passwords are required" });
      }

      if (!validatePassword(newPassword)) {
        return res.status(400).json({
          message:
            "Password must be 8-128 characters with uppercase, lowercase, and number",
        });
      }

      if (oldPassword === newPassword) {
        return res.status(400).json({
          message: "New password must be different from old password",
        });
      }

      const user = await User.findById(req.user.id).select("+passwordHash");
      if (!user || !user.isActive) {
        return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      if (!user.passwordHash) {
        return res.status(400).json({
          message: "Password change not supported for social login accounts",
        });
      }

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      user.passwordHash = await User.hashPassword(newPassword);
      await user.save();

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error.message);

      if (error.message && error.message.includes("Password")) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
    }
  }

);

router.delete("/delete-account-now", authMiddleware, accountDeletionLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    console.log('Delete account request for user:', userId);

    if (!password || typeof password !== 'string') {
      console.log('Password validation failed');
      return res.status(400).json({ message: "Password is required", success: false });
    }

    const user = await User.findById(userId).select('+passwordHash');
    
    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND, success: false });
    }

    if (user.passwordHash) {
      console.log('Verifying password...');
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Password verification failed');
        return res.status(400).json({ message: "Incorrect password", success: false });
      }
      console.log('Password verified successfully');
    } else {
      console.log('OAuth user - skipping password verification');
    }

    console.log('Starting account deletion process...');

    const wallResult = await Wall.deleteMany({ ownerId: userId });
    console.log(`Deleted ${wallResult.deletedCount} walls`);

    const Feedback = mongoose.model("Feedback");
    const userWalls = await Wall.find({ ownerId: userId }).select("_id");
    const wallIds = userWalls.map((w) => w._id);
    const feedbackResult1 = await Feedback.deleteMany({ wallId: { $in: wallIds } });
    const feedbackResult2 = await Feedback.deleteMany({ userId });
    console.log(`Deleted ${feedbackResult1.deletedCount + feedbackResult2.deletedCount} feedback items`);

    if (user.profilePicture) {
      console.log('Deleting profile picture...');
      await deleteOldProfilePicture(user.profilePicture);
    }

    try {
      if (fs.existsSync(uploadDir)) {
        const userFiles = fs
          .readdirSync(uploadDir)
          .filter((file) => file.startsWith(`user-${userId}-`));
        for (const file of userFiles) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
        console.log(`Deleted ${userFiles.length} local files`);
      }
    } catch (err) {
      console.error("Failed to cleanup user files:", err);
      
    }

    
    await User.findByIdAndDelete(userId);
    console.log('User account deleted successfully');


    return res.status(200).json({ 
      message: "Account and all associated data deleted successfully",
      success: true 
    });
  } catch (err) {
    console.error("Account deletion error:", err);
    console.error("Error stack:", err.stack);
    
  
    return res.status(500).json({ 
      message: err.message || "Failed to delete account",
      success: false 
    });
  }
});

export default router;
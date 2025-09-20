import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import multer from 'multer';
import crypto from 'crypto';
import transporter from '../config/email.js';
import mongoose from 'mongoose';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import { promisify } from 'util';

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { fileTypeFromBuffer } from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many profile updates, please try again later' }
});

const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { message: 'Too many password change attempts, please try again later' }
});

const blockingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { message: 'Too many blocking actions, please slow down' }
});

const accountDeletionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: { message: 'Too many account deletion requests, please try again tomorrow' }
});

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const validateIP = (ip) => validator.isIP(ip);

const validatePassword = (password) => {
  return password && 
         typeof password === 'string' &&
         password.length >= 12 && 
         password.length <= 128 &&
         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password);
};

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/^\.+/, '')
    .substring(0, 100);
};

const validateFile = async (buffer) => {
  try {
    const type = await fileTypeFromBuffer(buffer);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    return (
      type &&
      allowedTypes.includes(type.mime) &&
      buffer.length <= maxSize &&
      buffer.length > 0
    );
  } catch (error) {
    console.error('File validation error:', error.message);
    return false;
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 0
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();
const ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS = 24;

const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An error occurred. Please try again.',
  UNAUTHORIZED: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Invalid input provided',
  USER_NOT_FOUND: 'User not found or inactive'
};

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry');
    if (!user || !user.isActive) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.patch('/profile', authMiddleware, profileUpdateLimiter, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['bio', 'socialLinks', 'profileVisibility'];
    const isValid = Object.keys(updates).every((key) => allowedUpdates.includes(key));

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid field in update request' });
    }

    if (updates.bio !== undefined) {
      if (typeof updates.bio !== 'string' || updates.bio.length > 500) {
        return res.status(400).json({ message: 'Bio must be a string with max 500 characters' });
      }
      updates.bio = validator.escape(updates.bio.trim());
    }
  
    if (updates.profileVisibility !== undefined) {
      const validVisibilities = ['public', 'private', 'friends'];
      if (!validVisibilities.includes(updates.profileVisibility)) {
        return res.status(400).json({ message: 'Invalid profile visibility option' });
      }
    }

    if (updates.socialLinks !== undefined) {
      const { twitter, linkedin, website, instagram } = updates.socialLinks;
      
      if (twitter && !validator.isURL(twitter)) {
        return res.status(400).json({ message: 'Invalid Twitter URL' });
      }
      if (linkedin && !validator.isURL(linkedin)) {
        return res.status(400).json({ message: 'Invalid LinkedIn URL' });
      }
      if (website && !validator.isURL(website)) {
        return res.status(400).json({ message: 'Invalid website URL' });
      }
      if (instagram && !validator.isURL(instagram)) {
        return res.status(400).json({ message: 'Invalid Instagram URL' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: updates }, 
      {
        new: true,
        runValidators: true,
        select: '-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry',
      }
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages
      });
    }
    
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.patch('/profile-picture', authMiddleware, profileUpdateLimiter, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const valid = await validateFile(req.file.buffer);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid file type, size, or corrupted file' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedOriginal = sanitizeFilename(req.file.originalname);
    const filename = `user-${req.user.id}-${uniqueSuffix}-${sanitizedOriginal}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, req.file.buffer);

    const profilePictureUrl = `/uploads/${filename}`;
 
    const currentUser = await User.findById(req.user.id).select('profilePicture');
    const oldProfilePicture = currentUser?.profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { profilePicture: profilePictureUrl }, 
      {
        new: true,
        runValidators: true,
        select: '-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry',
      }
    );

    if (!user) {
      try {
        await unlink(filepath);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError.message);
      }
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (oldProfilePicture && oldProfilePicture.startsWith('/uploads/')) {
      const oldFilePath = path.join(uploadDir, path.basename(oldProfilePicture));
      try {
        await access(oldFilePath);
        await unlink(oldFilePath);
      } catch (error) {
        console.error('Failed to delete old profile picture:', error.message);
      }
    }

    res.json({ 
      message: 'Profile picture updated successfully', 
      profilePicture: profilePictureUrl 
    });

  } catch (error) {
    console.error('Profile picture upload error:', error.message);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed' });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field' });
      }
    }
    
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.patch('/notifications', authMiddleware, profileUpdateLimiter, async (req, res) => {
  try {
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Invalid notification settings' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id, 
      { emailNotifications: updates }, 
      {
        new: true,
        runValidators: true,
        select: '-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry',
      }
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    res.json({ emailNotifications: user.emailNotifications });
  } catch (error) {
    console.error('Notification settings update error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.post('/block', authMiddleware, blockingLimiter, async (req, res) => {
  try {
    const { userIdToBlock, ipToBlock } = req.body;
    const currentUserId = req.user.id;

    if (!userIdToBlock && !ipToBlock) {
      return res.status(400).json({ message: 'Must provide userIdToBlock or ipToBlock' });
    }

    if (userIdToBlock) {
      if (!validateObjectId(userIdToBlock)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
      if (userIdToBlock === currentUserId) {
        return res.status(400).json({ message: 'Cannot block yourself' });
      }
      
      const userToBlock = await User.findById(userIdToBlock).select('_id');
      if (!userToBlock) {
        return res.status(404).json({ message: 'User to block not found' });
      }
    }
    if (ipToBlock && !validateIP(ipToBlock)) {
      return res.status(400).json({ message: 'Invalid IP address format' });
    }

    const update = { $addToSet: {} };
    if (userIdToBlock) update.$addToSet.blockedUsers = userIdToBlock;
    if (ipToBlock) update.$addToSet.blockedIps = ipToBlock;

    const user = await User.findByIdAndUpdate(
      currentUserId, 
      update, 
      {
        new: true,
        select: '-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry',
      }
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    res.json({ 
      message: 'Blocked successfully', 
      blockedUsers: user.blockedUsers || [], 
      blockedIps: user.blockedIps || [] 
    });

  } catch (error) {
    console.error('Block operation error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.delete('/unblock', authMiddleware, blockingLimiter, async (req, res) => {
  try {
    const { userIdToUnblock, ipToUnblock } = req.body;
    const currentUserId = req.user.id;

    if (!userIdToUnblock && !ipToUnblock) {
      return res.status(400).json({ message: 'Must provide userIdToUnblock or ipToUnblock' });
    }

    if (userIdToUnblock && !validateObjectId(userIdToUnblock)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    if (ipToUnblock && !validateIP(ipToUnblock)) {
      return res.status(400).json({ message: 'Invalid IP address format' });
    }

    const update = { $pull: {} };
    if (userIdToUnblock) update.$pull.blockedUsers = userIdToUnblock;
    if (ipToUnblock) update.$pull.blockedIps = ipToUnblock;

    const user = await User.findByIdAndUpdate(
      currentUserId, 
      update, 
      {
        new: true,
        select: '-passwordHash -googleId -accountDeletionToken -accountDeletionTokenExpiry',
      }
    );

    if (!user) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    
    res.json({ 
      message: 'Unblocked successfully', 
      blockedUsers: user.blockedUsers || [], 
      blockedIps: user.blockedIps || [] 
    });

  } catch (error) {
    console.error('Unblock operation error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.post('/change-password', authMiddleware, passwordChangeLimiter, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be 12-128 characters with uppercase, lowercase, number, and special character' 
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ message: 'New password must be different from old password' });
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ 
        message: 'Password change not supported for social login accounts' 
      });
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error.message);
    
    if (error.message && error.message.includes('Password')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.post('/request-account-deletion', authMiddleware, accountDeletionLimiter, async (req, res) => {
  try {
    const { currentPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+passwordHash');
    if (!user || !user.isActive) {
      return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Current password required for account deletion confirmation' 
        });
      }
      
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS);

    await User.findByIdAndUpdate(userId, {
      accountDeletionToken: token,
      accountDeletionTokenExpiry: expiry,
    });

    if (transporter) {
      try {
        const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-deletion`;
        
        const mailOptions = {
          from: `"Spillr Support" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Confirm Account Deletion - Spillr',
          html: `
            <h2>Account Deletion Request</h2>
            <p>Hi ${validator.escape(user.name || 'there')},</p>
            <p>You have requested to delete your Spillr account (${validator.escape(user.email)}).</p>
            <p><strong>To complete the deletion process:</strong></p>
            <ol>
              <li>Visit: <a href="${confirmationUrl}">${confirmationUrl}</a></li>
              <li>Enter your deletion token: <code>${token}</code></li>
              <li>Enter your User ID: <code>${userId}</code></li>
            </ol>
            <p><strong>This link and token expire in ${ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS} hours.</strong></p>
            <p>If you did not request this deletion, please ignore this email and your account will remain active.</p>
            <p><em>Warning: This action is permanent and cannot be undone.</em></p>
            <hr>
            <p>Thanks,<br>The Spillr Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
        res.json({ 
          message: `Account deletion confirmation sent to ${user.email}. Please check your inbox.` 
        });

      } catch (emailError) {
        console.error('Account deletion email error:', emailError.message);
        return res.status(500).json({ 
          message: 'Failed to send confirmation email. Please try again later.' 
        });
      }
    } else {
      res.status(200).json({ 
        message: 'Account marked for deletion. Email service not configured - please contact support.' 
      });
    }

  } catch (error) {
    console.error('Account deletion request error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.post('/confirm-account-deletion', async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    if (!token || !userId) {
      return res.status(400).json({ message: 'Missing token or userId' });
    }

    if (!validateObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }

    const user = await User.findOne({ 
      _id: userId, 
      accountDeletionToken: token 
    }).select('+accountDeletionToken +accountDeletionTokenExpiry');

    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' });
    }

    if (!user.accountDeletionTokenExpiry || user.accountDeletionTokenExpiry < Date.now()) {
      return res.status(400).json({ message: 'Deletion token has expired. Please request again.' });
    }

    await User.findByIdAndDelete(userId);
    
    try {
      const userFiles = fs.readdirSync(uploadDir).filter(file => file.startsWith(`user-${userId}-`));
      for (const file of userFiles) {
        await unlink(path.join(uploadDir, file));
      }
    } catch (cleanupError) {
      console.error('Failed to cleanup user files:', cleanupError.message);
    }

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Account deletion confirmation error:', error.message);
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
});

router.get('/confirm-account-deletion', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/confirm-deletion?${new URLSearchParams(req.query).toString()}`);
});

export default router;
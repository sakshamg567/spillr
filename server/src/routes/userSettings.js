
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import multer from 'multer';
import crypto from 'crypto';
import transporter from '../config/email.js';
import mongoose from 'mongoose';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = path.join(__dirname, '..', 'uploads');


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadDir}`);
}


const storage = multer.diskStorage({
  
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});


const router = express.Router();

const ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS = 24;

// current user's full settings/profile data
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
                           .select('-passwordHash -googleId');
    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found or inactive' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user settings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const allowedUpdates = ['bio', 'socialLinks', 'profileVisibility'];
    const isValidOperation = Object.keys(updates).every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    if (updates.bio && updates.bio.length > 500) {
        return res.status(400).json({ message: 'Bio must be less than 500 characters.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-passwordHash -googleId' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UPDATE Profile Picture

router.patch('/profile-picture', authMiddleware, upload.single('profilePic'), async (req, res) => {
    try {
        // Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const profilePictureUrl = `/uploads/${req.file.filename}`; 

       
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: profilePictureUrl }, 
            { new: true, runValidators: true, select: '-passwordHash -googleId' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile picture updated successfully', profilePicture: profilePictureUrl });

    } catch (err) {
        console.error('Error uploading profile picture:', err);
       
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
            }
          
        } else if (err.message === 'Only image files are allowed!') {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Internal server error during file upload' });
    }
});

//  Notification Settings
router.patch('/notifications', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { emailNotifications: updates },
      { new: true, runValidators: true, select: '-passwordHash -googleId' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ emailNotifications: user.emailNotifications });
  } catch (err) {
    console.error('Error updating notifications:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//BLOCK a User
router.post('/block/:userIdToBlock', authMiddleware, async (req, res) => {
  try {
    const userIdToBlock = req.params.userIdToBlock;
    const currentUserId = req.user.id;

    if (userIdToBlock === currentUserId) {
        return res.status(400).json({ message: 'You cannot block yourself.' });
    }

    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { blockedUsers: userIdToBlock } },
      { new: true, select: '-passwordHash -googleId' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User blocked successfully', blockedUsers: user.blockedUsers });
  } catch (err) {
    console.error('Error blocking user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UNBLOCK a User 
router.delete('/unblock/:userIdToUnblock', authMiddleware, async (req, res) => {
  try {
    const userIdToUnblock = req.params.userIdToUnblock;
    const currentUserId = req.user.id;

    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { blockedUsers: userIdToUnblock } },
      { new: true, select: '-passwordHash -googleId' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User unblocked successfully', blockedUsers: user.blockedUsers });
  } catch (err) {
    console.error('Error unblocking user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CHANGE PASSWORD 
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
             return res.status(400).json({ message: 'Old password and new password are required.' });
        }

        if (newPassword.length < 8) {
             return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
        }

        const user = await User.findById(req.user.id).select('+passwordHash');
        if (!user || !user.passwordHash) {
            return res.status(400).json({ message: 'Password change not supported for this account (likely Google login).' });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect.' });
        }

        const newHash = await User.hashPassword(newPassword); 
        user.passwordHash = newHash;
        await user.save();

        res.json({ message: 'Password changed successfully.' });

    } catch (err) {
        console.error('Error changing password:', err);
        if (err.message.includes('Password')) {
             return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// REQUEST ACCOUNT DELETION 
router.post('/request-account-deletion', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS);

        await User.findByIdAndUpdate(userId, {
            accountDeletionToken: token,
            accountDeletionTokenExpiry: expiryDate
        });

        if (transporter) {
            try {
                const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-account-deletion?token=${token}&userId=${userId}`;

                const mailOptions = {
                    from: `"Spillr" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `Confirm Account Deletion - YourAppName`,
                    text: `Hi ${user.name || 'there'},

You have requested to delete your YourAppName account (${user.email}).

To confirm this action, please click the link below within ${ACCOUNT_DELETION_TOKEN_EXPIRY_HOURS} hours:

${confirmationUrl}

If you did not request this, please ignore this email. Your account will remain active.

This action is irreversible and will permanently delete your account and associated data.

Thanks,
The Spillr Team`,
                };

                await transporter.sendMail(mailOptions);
                console.log(`📧 Account deletion confirmation email sent to ${user.email}`);
                res.json({ message: `Confirmation email sent to ${user.email}. Please check your inbox.` });
            } catch (emailErr) {
                console.error(" Error sending account deletion confirmation email:", emailErr.message);
                return res.status(500).json({ message: 'Failed to send confirmation email. Please try again later.' });
            }
        } else {
            console.warn(" Email transporter not configured. Cannot send account deletion confirmation email.");
            res.status(200).json({ message: 'Account marked for deletion. However, email confirmation could not be sent. Please contact support to finalize the deletion (email service not configured).' });
        }

    } catch (err) {
        console.error('Error requesting account deletion:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// CONFIRM ACCOUNT DELETION 
router.get('/confirm-account-deletion', async (req, res) => {
    try {
        const { token, userId } = req.query;

        if (!token || !userId) {
            return res.status(400).send('Invalid request. Missing token or user ID.');
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
             return res.status(400).send('Invalid user ID format.');
        }

        const user = await User.findOne({
            _id: userId,
            accountDeletionToken: token
        }).select('+accountDeletionToken +accountDeletionTokenExpiry');

        if (!user) {
            return res.status(400).send('Invalid or expired token, or user not found.');
        }

        if (user.accountDeletionTokenExpiry < Date.now()) {
            return res.status(400).send('This deletion link has expired. Please request account deletion again.');
        }
        await User.findByIdAndDelete(userId);

        res.send(`
            <h2>Account Deleted</h2>
            <p>Your YourAppName account (${user.email}) and associated data have been successfully deleted.</p>
            <p>This action is irreversible.</p>
        `);

    } catch (err) {
        console.error('Error confirming account deletion:', err);
        res.status(500).send('An error occurred while processing your request. Please try again later or contact support.');
    }
});

export default router;
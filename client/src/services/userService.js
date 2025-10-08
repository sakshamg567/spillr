import { apiRequest, createFormDataRequest } from './api.js';

export const userService = {
  getProfile: async () => {
    try {
      return await apiRequest('/api/settings/me');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      return await apiRequest('/api/settings/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  uploadProfilePicture: async (file) => {
    try {
      const formDataRequest = createFormDataRequest({}, 'profilePic', file);
      
      return await apiRequest('/api/settings/profile-picture', {
        ...formDataRequest,
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  updateNotifications: async (notificationSettings) => {
    try {
      return await apiRequest('/api/settings/notifications', {
        method: 'PATCH',
        body: JSON.stringify(notificationSettings)
      });
    } catch (error) {
      console.error('Update notifications error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      return await apiRequest('/api/settings/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData)
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  blockUser: async (userIdToBlock) => {
    try {
      return await apiRequest('/api/settings/block', {
        method: 'POST',
        body: JSON.stringify({ userIdToBlock })
      });
    } catch (error) {
      console.error('Block user error:', error);
      throw error;
    }
  },

  blockIP: async (ipToBlock) => {
    try {
      return await apiRequest('/api/settings/block', {
        method: 'POST',
        body: JSON.stringify({ ipToBlock })
      });
    } catch (error) {
      console.error('Block IP error:', error);
      throw error;
    }
  },

  unblockUser: async (userIdToUnblock) => {
    try {
      return await apiRequest('/api/settings/unblock', {
        method: 'DELETE',
        body: JSON.stringify({ userIdToUnblock })
      });
    } catch (error) {
      console.error('Unblock user error:', error);
      throw error;
    }
  },

  unblockIP: async (ipToUnblock) => {
    try {
      return await apiRequest('/api/settings/unblock', {
        method: 'DELETE',
        body: JSON.stringify({ ipToUnblock })
      });
    } catch (error) {
      console.error('Unblock IP error:', error);
      throw error;
    }
  },

  requestAccountDeletion: async (currentPassword) => {
    try {
      return await apiRequest('/api/settings/request-account-deletion', {
        method: 'POST',
        body: JSON.stringify({ currentPassword })
      });
    } catch (error) {
      console.error('Request account deletion error:', error);
      throw error;
    }
  },

  confirmAccountDeletion: async (token, userId) => {
    try {
      return await apiRequest('/api/settings/confirm-account-deletion', {
        method: 'POST',
        body: JSON.stringify({ token, userId })
      });
    } catch (error) {
      console.error('Confirm account deletion error:', error);
      throw error;
    }
  },

  validateBio: (bio) => {
    if (bio && bio.length > 500) {
      return { isValid: false, error: 'Bio must be less than 500 characters' };
    }
    return { isValid: true };
  },

  validateSocialLinks: (socialLinks) => {
    const errors = [];
    const urlRegex = /^https?:\/\/.+\..+/;

    if (socialLinks.twitter && !urlRegex.test(socialLinks.twitter)) {
      errors.push('Twitter URL must be a valid URL');
    }

    if (socialLinks.linkedin && !urlRegex.test(socialLinks.linkedin)) {
      errors.push('LinkedIn URL must be a valid URL');
    }

    if (socialLinks.website && !urlRegex.test(socialLinks.website)) {
      errors.push('Website URL must be a valid URL');
    }

    if (socialLinks.instagram && !urlRegex.test(socialLinks.instagram)) {
      errors.push('Instagram URL must be a valid URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  validatePasswordStrength: (password) => {
    const feedback = [];
    let score = 0;

    if (!password) {
      return { isValid: false, score: 0, feedback: ['Password is required'] };
    }

    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 12 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) score += 1;
    else feedback.push('Add special characters (@$!%*?&)');

    if (password.length > 128) {
      feedback.push('Password is too long (max 128 characters)');
      score = 0;
    }

    return {
      isValid: score >= 5 && feedback.length === 0,
      score: Math.min(score, 6),
      feedback
    };
  },

  validateProfilePicture: (file) => {
    if (!file) {
      return { isValid: false, error: 'File is required' };
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Only JPEG, PNG, and WebP images are allowed' 
      };
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'File size must be less than 5MB' 
      };
    }

    return { isValid: true };
  }
};
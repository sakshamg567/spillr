import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/userService.js';

export const useUser = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getProfile();
      setProfile(userData);
      
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await userService.updateProfile(profileData);
      setProfile(updatedUser);
      
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfilePicture = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.uploadProfilePicture(file);
      
      setProfile(prev => ({
        ...prev,
        profilePicture: response.profilePicture
      }));
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotifications = useCallback(async (settings) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.updateNotifications(settings);
      
      setProfile(prev => ({
        ...prev,
        emailNotifications: response.emailNotifications
      }));
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
    uploadProfilePicture,
    updateNotifications,
    clearError: () => setError(null)
  };
};

export const usePasswordChange = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }

    const passwordValidation = userService.validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.feedback[0];
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await userService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess(true);
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccess(false);
  }, []);

  return {
    formData,
    errors,
    loading,
    success,
    handleChange,
    handleSubmit,
    resetForm
  };
};

export const useProfileForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    bio: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: '',
      instagram: ''
    },
    profileVisibility: 'public',
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useUser();

  const validateForm = () => {
    const newErrors = {};

    const bioValidation = userService.validateBio(formData.bio);
    if (!bioValidation.isValid) {
      newErrors.bio = bioValidation.error;
    }

    const socialValidation = userService.validateSocialLinks(formData.socialLinks);
    if (!socialValidation.isValid) {
      newErrors.socialLinks = socialValidation.errors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await updateProfile(formData);
      return result;
    } catch (error) {
      setErrors({ submit: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setFormData
  };
};

export const useProfilePictureUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadProfilePicture } = useUser();

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);

      const validation = userService.validateProfilePicture(file);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }

      const result = await uploadProfilePicture(file);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleFileUpload,
    clearError: () => setError(null)
  };
};

export const useBlockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const blockUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.blockUser(userId);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const blockIP = async (ip) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.blockIP(ip);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.unblockUser(userId);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unblockIP = async (ip) => {
    try {
      setLoading(true);
      setError(null);
      return await userService.unblockIP(ip);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    blockUser,
    blockIP,
    unblockUser,
    unblockIP,
    clearError: () => setError(null)
  };
};

export const useAccountDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const requestDeletion = async (currentPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userService.requestAccountDeletion(currentPassword);
      setSuccess(true);
      
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletion = async (token, userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await userService.confirmAccountDeletion(token, userId);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    requestDeletion,
    confirmDeletion,
    resetState
  };
};
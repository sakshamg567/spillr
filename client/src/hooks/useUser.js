import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/userService.js';


export const useUser = (autoFetch = true) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOperationPending, setIsOperationPending] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getProfile();
      setProfile(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  const updateProfile = useCallback(async (profileData) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await userService.updateProfile(profileData);
      setProfile(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  const uploadProfilePicture = useCallback(async (file) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const response = await userService.uploadProfilePicture(file);
      setProfile(prev => prev ? { ...prev, profilePicture: response.profilePicture } : null);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to upload picture');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  const updateNotifications = useCallback(async (settings) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    try {
      setLoading(true);
      setError(null);
      const response = await userService.updateNotifications(settings);
      setProfile(prev => prev ? { ...prev, emailNotifications: response.emailNotifications } : null);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update notifications');
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  useEffect(() => {
    if (autoFetch) {
      fetchProfile();
    }
  }, [fetchProfile, autoFetch]);

  const clearError = useCallback(() => setError(null), []);

  return {
    profile,
    loading,
    error,
    reloadProfile: fetchProfile,
    updateProfile,
    uploadProfilePicture,
    updateNotifications,
    clearError
  };
};

// ====== Password Change Hook ======
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

  const handleChange = (field) => (valueOrEvent) => {
    const value = valueOrEvent?.target?.value !== undefined 
      ? valueOrEvent.target.value 
      : valueOrEvent;

    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (success) {
      setSuccess(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await userService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setSuccess(false);
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  return {
    formData,
    errors,
    loading,
    success,
    handleChange,
    handleSubmit,
    resetForm,
    clearErrors
  };
};


export const useProfileForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    bio: '',
    socialLinks: { twitter: '', linkedin: '', website: '', instagram: '' },
    profileVisibility: 'public'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useUser();

  useEffect(() => {
    setFormData({
      bio: initialData.bio || '',
      socialLinks: {
        twitter: initialData.socialLinks?.twitter || '',
        linkedin: initialData.socialLinks?.linkedin || '',
        website: initialData.socialLinks?.website || '',
        instagram: initialData.socialLinks?.instagram || ''
      },
      profileVisibility: initialData.profileVisibility || 'public'
    });
  }, [initialData]);

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

  const handleChange = (field) => (valueOrEvent) => {
    const value = valueOrEvent?.target?.value !== undefined 
      ? valueOrEvent.target.value 
      : valueOrEvent;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const result = await updateProfile(formData);
      return result;
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save profile' });
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
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    handleFileUpload,
    clearError
  };
};


export const useBlockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithLoading = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      return await apiCall();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = useCallback((userId) => executeWithLoading(() => userService.blockUser(userId)), []);
  const blockIP = useCallback((ip) => executeWithLoading(() => userService.blockIP(ip)), []);
  const unblockUser = useCallback((userId) => executeWithLoading(() => userService.unblockUser(userId)), []);
  const unblockIP = useCallback((ip) => executeWithLoading(() => userService.unblockIP(ip)), []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    blockUser,
    blockIP,
    unblockUser,
    unblockIP,
    clearError
  };
};

// ====== Account Deletion Hook ======
export const useAccountDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const executeWithLoading = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      return await apiCall();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const requestDeletion = useCallback(async (currentPassword) => {
    const result = await executeWithLoading(() => userService.requestAccountDeletion(currentPassword));
    setSuccess(true);
    return result;
  }, []);

  const confirmDeletion = useCallback(async (token, userId) => {
    return executeWithLoading(() => userService.confirmAccountDeletion(token, userId));
  }, []);

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
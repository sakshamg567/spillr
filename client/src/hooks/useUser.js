import { useState, useCallback, useEffect,useRef }from 'react' 
import { userService } from '../services/userService.js';

export const useUser = (autoFetch = true) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOperationPending, setIsOperationPending] = useState(false);

  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);


  const fetchProfile = useCallback(async (force = false) => {
    if (isFetchingRef.current && !force) {
      console.log('⏭️ Skipping fetchProfile - already in progress');
      return;
    }
    
    isFetchingRef.current = true;
    setIsOperationPending(true);
    setLoading(true);
    setError(null);

    try {
      //console.log(' Fetching fresh profile data...');
      const userData = await userService.getProfile();
     // console.log('Profile fetched:', userData);
      setProfile(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      //console.error(' fetchProfile error:', err);
    } finally {
      setLoading(false);
      setIsOperationPending(false);
      isFetchingRef.current = false;
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await userService.updateProfile(profileData);
      setProfile(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);


  const uploadProfilePicture = useCallback(async (file) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    setLoading(true);
    setError(null);

    try {
      const response = await userService.uploadProfilePicture(file);
      const freshProfile = await userService.getProfile();
      setProfile(freshProfile);
      
      return response;
    } catch (err) {
      setError(err.message || 'Failed to upload picture');
      throw err;
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  const updateNotifications = useCallback(async (settings) => {
    if (isOperationPending) return;
    setIsOperationPending(true);
    setLoading(true);
    setError(null);

    try {
      const response = await userService.updateNotifications(settings);
      setProfile(prev => prev ? { ...prev, emailNotifications: response.emailNotifications } : null);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update notifications');
      throw err;
    } finally {
      setLoading(false);
      setIsOperationPending(false);
    }
  }, [isOperationPending]);

  useEffect(() => {
    if (autoFetch && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchProfile();
    }
  }, [autoFetch, fetchProfile]);

  const clearError = useCallback(() => setError(null), []);

  return {
    profile,
    loading,
    error,
    isOperationPending,
    reloadProfile: () => fetchProfile(true),
    updateProfile,
    uploadProfilePicture,
    updateNotifications,
    clearError
  };
};



export const usePasswordChange = () => {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.oldPassword) newErrors.oldPassword = 'Current password is required';
    const passwordValidation = userService.validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) newErrors.newPassword = passwordValidation.feedback[0];
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.oldPassword === formData.newPassword) newErrors.newPassword = 'New password must be different from current password';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((field) => (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (success) setSuccess(false);
  }, [errors, success]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await userService.changePassword({ oldPassword: formData.oldPassword, newPassword: formData.newPassword });
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm]);

  const resetForm = useCallback(() => {
    setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setErrors({});
    setSuccess(false);
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { formData, errors, loading, success, handleChange, handleSubmit, resetForm, clearErrors };
};


export const useProfileForm = (initialData = {}) => {
  const [formData, setFormData] = useState({ name: '', username: '', bio: '', socialLinks: { twitter: '', linkedin: '', website: '', instagram: '' } });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { updateProfile } = useUser();

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        username: initialData.username || '',
        bio: initialData.bio || '',
        socialLinks: {
          twitter: initialData.socialLinks?.twitter || '',
          linkedin: initialData.socialLinks?.linkedin || '',
          website: initialData.socialLinks?.website || '',
          instagram: initialData.socialLinks?.instagram || ''
        }
      });
    }
  }, [initialData]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (formData.name) {
      const nameValidation = userService.validateName(formData.name);
      if (!nameValidation.isValid) newErrors.name = nameValidation.error;
    }
    if (formData.username) {
      const usernameValidation = userService.validateUsername(formData.username);
      if (!usernameValidation.isValid) newErrors.username = usernameValidation.error;
    }
    const bioValidation = userService.validateBio(formData.bio);
    if (!bioValidation.isValid) newErrors.bio = bioValidation.error;
    const socialValidation = userService.validateSocialLinks(formData.socialLinks);
    if (!socialValidation.isValid) newErrors.socialLinks = socialValidation.errors;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((field) => (valueOrEvent) => {
    const value = valueOrEvent?.target?.value ?? valueOrEvent;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
      setErrors(prev => prev[parent]?.[child] ? { ...prev, [parent]: { ...prev[parent], [child]: '' } } : prev);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault?.();
    if (!validateForm()) return;
    setLoading(true);
    try {
      return await updateProfile(formData);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save profile' });
    } finally {
      setLoading(false);
    }
  }, [formData, updateProfile, validateForm]);

  const setForm = useCallback((data) => setFormData(data), []);

  return { formData, errors, loading, handleChange, handleSubmit, setFormData: setForm };
};

export const useProfilePictureUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadProfilePicture } = useUser();

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    try {
      const validation = userService.validateProfilePicture(file);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
      return await uploadProfilePicture(file);
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  }, [uploadProfilePicture]);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, handleFileUpload, clearError };
};


export const useBlockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeWithLoading = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      return await apiCall();
    } catch (err) {
      setError(err.message || 'Operation failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);



  return {
    loading,
    error,
    blockUser: useCallback((userId) => executeWithLoading(() => userService.blockUser(userId)), [executeWithLoading]),
    blockIP: useCallback((ip) => executeWithLoading(() => userService.blockIP(ip)), [executeWithLoading]),
    unblockUser: useCallback((userId) => executeWithLoading(() => userService.unblockUser(userId)), [executeWithLoading]),
    unblockIP: useCallback((ip) => executeWithLoading(() => userService.unblockIP(ip)), [executeWithLoading]),
    clearError: useCallback(() => setError(null), [])
  };
};


export const useAccountDeletion = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const requestDeletion = useCallback(async (password) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_BASE_URL}/api/settings/delete-account-now`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      setSuccess(true);
      
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    loading,
    success,
    error,
    requestDeletion,
    resetState
  };
};
// client/src/utils/api.js

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: getAuthHeaders(),
    ...options,
    // Merge headers if provided in options
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Specific API functions
export const auth = {
  login: (credentials) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  
  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
};

export const user = {
  getProfile: () => apiRequest('/settings/me'),
  
  updateProfile: (profileData) => 
    apiRequest('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    }),
  
  updateNotifications: (notificationSettings) => 
    apiRequest('/settings/notifications', {
      method: 'PATCH',
      body: JSON.stringify(notificationSettings)
    }),
  
  changePassword: (passwordData) => 
    apiRequest('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    }),
  
  uploadProfilePicture: (formData) => 
    apiRequest('/settings/profile-picture', {
      method: 'PATCH',
      body: formData,
      headers: {} // Don't set Content-Type for FormData, let browser set it
    }),
};

export const wall = {
  create: (wallData) => 
    apiRequest('/wall', {
      method: 'POST',
      body: JSON.stringify(wallData)
    }),
  
  getBySlug: (slug) => apiRequest(`/wall/${slug}`),
};

export const feedback = {
  submit: (feedbackData) => 
    apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    }),
  
  getForOwner: (wallId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/feedback/owner/${wallId}${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },
  
  answer: (feedbackId, answer) => 
    apiRequest(`/feedback/${feedbackId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer })
    }),
  
  react: (feedbackId, emoji) => 
    apiRequest(`/feedback/${feedbackId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    }),
  
  getPublic: (slug) => apiRequest(`/feedback/wall/${slug}`),
};
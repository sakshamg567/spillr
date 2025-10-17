const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 

export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED', 
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND'
};

class APIError extends Error{
    constructor(message, type, status , data = null){
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.status = status;
        this.data = data;
    }
}

const getAuthHeaders = (isFormData = false) => {

const headers = {};
if (!isFormData) headers['Content-Type'] = 'application/json';

return headers;
};

export const apiRequest = async (endpoint, options = {}) => {
const url = `${API_BASE_URL}${endpoint}`;
const isFormData = options.body instanceof FormData;

  const config = {
...options,
method: options.method || 'GET',
headers: {
...getAuthHeaders(isFormData),
...(options.headers || {})
},
credentials: 'include'
};

  console.log('API Request:', { 
    url, 
    method: config.method,
    hasCredentials: config.credentials 
  });

   try {
    const response = await fetch(url, config);
    
    console.log('API Response:', { 
      url, 
      status: response.status,
       headers: Object.fromEntries(response.headers.entries()),
      statusText: response.statusText 
    });

    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      switch (response.status) {
        case 401:
          
          window.dispatchEvent(new CustomEvent('auth-expired'));
          throw new APIError(
            data.message || 'Authentication required',
            API_ERRORS.UNAUTHORIZED,
            401,
            data
          );
        
        case 400:
          throw new APIError(
            data.message || 'Invalid request',
            API_ERRORS.VALIDATION_ERROR,
            400,
            data
          );
        
        case 404:
          throw new APIError(
            data.message || 'Resource not found',
            API_ERRORS.NOT_FOUND,
            404,
            data
          );
        
        case 429:
          throw new APIError(
            data.message || 'Too many requests',
            API_ERRORS.RATE_LIMITED,
            429,
            data
          );
        
        case 500:
        default:
          throw new APIError(
            data.message || 'Server error',
            API_ERRORS.SERVER_ERROR,
            response.status,
            data
          );
      }
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new APIError(
        'Network error. Please check your connection.',
        API_ERRORS.NETWORK_ERROR,
        0,
        null
      );
    }
    
   
    throw new APIError(
      error.message || 'An unexpected error occurred',
      API_ERRORS.SERVER_ERROR,
      0,
      null
    );
  }
};

export const apiRequestWithLoading = async (endpoint, options = {}, setLoading) => {
  if (setLoading) setLoading(true);
  
  try {
    const result = await apiRequest(endpoint, options);
    return result;
  } finally {
    if (setLoading) setLoading(false);
  }
};


export const createFormDataRequest = (data, fileKey, file) => {
  const formData = new FormData();
  
  if (file) {
    formData.append(fileKey, file);
  }
  
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return {
    method: 'POST',
    body: formData,
    headers: {}
  };
};



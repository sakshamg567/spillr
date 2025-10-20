export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  

  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    return `${baseUrl}${imagePath}`;
  }
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return name[0].toUpperCase();
};

export const isValidImageUrl = (url) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/');
};
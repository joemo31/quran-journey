// Central place for all environment-based config
export const API_URL  = process.env.REACT_APP_API_URL  || 'http://localhost:5000/api';
export const BASE_URL = API_URL.replace('/api', '');

// Helper to build a full media URL from a relative path like /uploads/folder/file.jpg
export const mediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;   // already absolute
  return `${BASE_URL}${path}`;
};

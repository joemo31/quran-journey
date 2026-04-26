// Central place for all environment-based config
const DEFAULT_API_URL = 'http://localhost:5000/api';

export const API_URL = (process.env.REACT_APP_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
export const BASE_URL = API_URL.replace(/\/api\/?$/, '');

export const mediaUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${BASE_URL}${value}`;
  }

  return `${BASE_URL}/${value.replace(/^\/+/, '')}`;
};

export const backgroundImageStyle = (value, fallback = {}) => {
  const url = mediaUrl(value);
  if (!url) return fallback;

  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
};

// In production (Vercel), use relative URLs so API calls go to the same domain
// In development, use localhost with the dev server port
const getApiBaseUrl = () => {
  // If we're in production (deployed), use relative paths
  if (typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  )) {
    // Development: use the backend dev server
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  } else {
    // Production: use relative path (same domain as frontend)
    return import.meta.env.VITE_API_BASE_URL || '/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// API Logging Configuration
export const API_LOGGING_ENABLED = import.meta.env.VITE_API_LOGGING_ENABLED === 'true';

// We can add other shared configurations here, like default headers, timeout settings, etc. 
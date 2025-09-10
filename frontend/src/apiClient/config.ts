export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API Logging Configuration
export const API_LOGGING_ENABLED = import.meta.env.VITE_API_LOGGING_ENABLED === 'true';

// We can add other shared configurations here, like default headers, timeout settings, etc. 
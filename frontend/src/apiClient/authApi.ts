import { API_BASE_URL } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  permissions: string[];
}

// Helper for error handling
const handleResponseError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: defaultMessage }));
    throw new Error(errorData.error || defaultMessage);
  }
  return response.json();
};

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponseError(response, 'Login failed');
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string): Promise<VerifyTokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseError(response, 'Token verification failed');
};

/**
 * Get current user data
 */
export const getCurrentUser = async (token: string): Promise<{ user: VerifyTokenResponse['user']; permissions: string[] }> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponseError(response, 'Failed to get user data');
};

/**
 * Helper functions for token management
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
}; 
import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Schemas from OpenAPI spec for Users

export interface SafeUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  status?: 'active' | 'pending' | 'inactive';
  created_at?: string; // date-time
  updated_at?: string; // date-time
  role?: Role;
}

export interface UserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  status?: 'active' | 'pending' | 'inactive';
  roleId?: number; // new field for role ID
}

export interface UserUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  status?: 'active' | 'pending' | 'inactive';
  roleId?: number; // new field for role ID
}

// Define User type from API
export interface ApiUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  updated_at: string;
  role?: Role;
}

// Define Role type
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<ApiUser[]> => {
  return apiGet('/users', 'Failed to fetch users');
};

/**
 * Create a new user
 */
export const createUser = async (userData: UserInput): Promise<{ success: boolean; userId: number; user: ApiUser }> => {
  return apiPost('/users', userData, 'Failed to create user');
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number | string): Promise<ApiUser> => {
  return apiGet(`/users/${id}`, `Failed to fetch user with id ${id}`);
};

/**
 * Get user's role
 */
export const getUserRole = async (id: number | string): Promise<{ role: Role | null }> => {
  return apiGet(`/users/${id}/role`, `Failed to fetch role for user with id ${id}`);
};

/**
 * Update user
 */
export const updateUser = async (
  id: number | string,
  userData: UserUpdateInput
): Promise<{ success: boolean; user: ApiUser }> => {
  return apiPut(`/users/${id}`, userData, `Failed to update user with id ${id}`);
};

/**
 * Delete user
 */
export const deleteUser = async (id: number | string): Promise<{ success: boolean }> => {
  return apiDelete(`/users/${id}`, `Failed to delete user with id ${id}`);
}; 
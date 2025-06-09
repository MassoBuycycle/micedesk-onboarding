import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Role interfaces
export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all roles
 */
export const getAllRoles = async (): Promise<Role[]> => {
  return apiGet('/roles', 'Failed to fetch roles');
};

/**
 * Get permissions for a role
 */
export const getRolePermissions = async (roleId: number): Promise<any[]> => {
  return apiGet(`/roles/${roleId}/permissions`, `Failed to fetch permissions for role ${roleId}`);
};

/**
 * Assign a role to a user
 */
export const assignRoleToUser = async (userId: number, roleId: number): Promise<{ success: boolean }> => {
  return apiPost('/roles/assign', { userId, roleId }, 'Failed to assign role to user');
};

/**
 * Remove a role from a user
 */
export const removeRoleFromUser = async (userId: number, roleId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/roles/users/${userId}/roles/${roleId}`, 'Failed to remove role from user');
};

/**
 * Get all roles assigned to a user
 */
export const getUserRoles = async (userId: number): Promise<Role[]> => {
  return apiGet(`/roles/users/${userId}`, `Failed to fetch roles for user ${userId}`);
}; 
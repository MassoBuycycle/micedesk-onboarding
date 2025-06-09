import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Interfaces for role/permission management

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
  category: string;
}

export interface ResourcePermission {
  id: number;
  user_id: number;
  resource_type: 'hotel' | 'room' | 'event' | 'file';
  resource_id: number;
  permission_type: 'view' | 'edit' | 'delete' | 'manage';
  granted_by?: number;
  created_at?: string;
}

export interface UserPermissionInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  permission_type: 'view' | 'edit' | 'delete' | 'manage';
  user_id: number;
  resource_id: number;
  resource_type: string;
}

// Role management API functions

/**
 * Get all roles
 */
export const getRoles = async (): Promise<Role[]> => {
  return apiGet('/roles', 'Failed to fetch roles');
};

/**
 * Create a new role
 */
export const createRole = async (data: { name: string; description?: string }): Promise<{ roleId: number; role: Role }> => {
  return apiPost('/roles', data, 'Failed to create role');
};

/**
 * Update a role
 */
export const updateRole = async (id: number, data: { name: string; description?: string }): Promise<{ role: Role }> => {
  return apiPut(`/roles/${id}`, data, 'Failed to update role');
};

/**
 * Delete a role
 */
export const deleteRole = async (id: number): Promise<{ success: boolean }> => {
  return apiDelete(`/roles/${id}`, 'Failed to delete role');
};

// Permission management API functions

/**
 * Get all permissions with categories
 */
export const getPermissions = async (): Promise<{
  categories: string[];
  permissions: Permission[];
  permissionsByCategory: Record<string, Permission[]>;
}> => {
  return apiGet('/roles/permissions', 'Failed to fetch permissions');
};

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = async (roleId: number): Promise<Permission[]> => {
  return apiGet(`/roles/${roleId}/permissions`, `Failed to fetch permissions for role ${roleId}`);
};

/**
 * Assign permissions to a role
 */
export const assignPermissionsToRole = async (roleId: number, permissionIds: number[]): Promise<{ success: boolean }> => {
  return apiPost(`/roles/${roleId}/permissions`, { permissionIds }, `Failed to assign permissions to role ${roleId}`);
};

// User role assignment API functions

/**
 * Get roles assigned to a user
 */
export const getUserRoles = async (userId: number): Promise<Role[]> => {
  return apiGet(`/roles/users/${userId}`, `Failed to fetch roles for user ${userId}`);
};

/**
 * Assign a role to a user
 */
export const assignRoleToUser = async (userId: number, roleId: number): Promise<{ success: boolean }> => {
  return apiPost('/roles/assign-user', { userId, roleId }, 'Failed to assign role to user');
};

/**
 * Remove a role from a user
 */
export const removeRoleFromUser = async (userId: number, roleId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/roles/users/${userId}/roles/${roleId}`, 'Failed to remove role from user');
};

// Resource permission API functions

/**
 * Set a resource permission for a user
 */
export const setResourcePermission = async (
  userId: number,
  resourceType: 'hotel' | 'room' | 'event' | 'file',
  resourceId: number,
  permissionType: 'view' | 'edit' | 'delete' | 'manage'
): Promise<{ success: boolean; permission: ResourcePermission }> => {
  return apiPost('/roles/resource-permissions', {
    userId,
    resourceType,
    resourceId,
    permissionType
  }, 'Failed to set resource permission');
};

/**
 * Remove a resource permission
 */
export const removeResourcePermission = async (
  userId: number,
  resourceType: 'hotel' | 'room' | 'event' | 'file',
  resourceId: number
): Promise<{ success: boolean }> => {
  return apiDelete(
    `/roles/resource-permissions/users/${userId}/resources/${resourceType}/${resourceId}`,
    'Failed to remove resource permission'
  );
};

/**
 * Get resource permissions for a user
 */
export const getUserResourcePermissions = async (
  userId: number,
  resourceType?: 'hotel' | 'room' | 'event' | 'file'
): Promise<ResourcePermission[]> => {
  const endpoint = resourceType
    ? `/roles/resource-permissions/users/${userId}/${resourceType}`
    : `/roles/resource-permissions/users/${userId}`;
  
  return apiGet(endpoint, `Failed to fetch resource permissions for user ${userId}`);
};

/**
 * Get users with permissions for a specific resource
 */
export const getResourcePermissionUsers = async (
  resourceType: 'hotel' | 'room' | 'event' | 'file',
  resourceId: number
): Promise<UserPermissionInfo[]> => {
  return apiGet(
    `/roles/resource-permissions/resources/${resourceType}/${resourceId}`,
    `Failed to fetch users with permissions for ${resourceType} ${resourceId}`
  );
}; 
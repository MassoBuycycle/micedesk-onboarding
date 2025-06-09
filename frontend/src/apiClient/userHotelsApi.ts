import { API_BASE_URL } from './config';
import { Hotel } from './hotelsApi';
import { apiGet, apiPost, apiDelete } from './apiClient';

// Define interfaces for user-hotel assignments
export interface UserHotelAssignment {
  userId: number | string;
  hotelId: number | string;
  assignedBy?: number | string;
}

export interface UserWithAssignmentInfo {
  id: number | string;
  first_name: string;
  last_name: string;
  email: string;
  has_all_access: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all hotels assigned to a user
 */
export const getHotelsByUserId = async (userId: number | string): Promise<{ hasAllAccess: boolean, hotels: Hotel[] }> => {
  return apiGet(`/user-hotels/users/${userId}/hotels`, `Failed to fetch hotels for user ${userId}`);
};

/**
 * Get all users assigned to a hotel
 */
export const getUsersByHotelId = async (hotelId: number | string): Promise<UserWithAssignmentInfo[]> => {
  return apiGet(`/user-hotels/hotels/${hotelId}/users`, `Failed to fetch users for hotel ${hotelId}`);
};

/**
 * Assign a user to a hotel
 */
export const assignUserToHotel = async (assignment: UserHotelAssignment): Promise<{ success: boolean, message: string }> => {
  return apiPost('/user-hotels/assignments', assignment, 'Failed to assign user to hotel');
};

/**
 * Unassign a user from a hotel
 */
export const unassignUserFromHotel = async (userId: number | string, hotelId: number | string): Promise<{ success: boolean, message: string }> => {
  return apiDelete(`/user-hotels/assignments/users/${userId}/hotels/${hotelId}`, 'Failed to unassign user from hotel');
};

/**
 * Grant a user access to all hotels
 */
export const grantAllHotelsAccess = async (userId: number | string, assignedBy?: number | string): Promise<{ success: boolean, message: string }> => {
  return apiPost('/user-hotels/all-access', { userId, assignedBy }, 'Failed to grant all hotels access');
};

/**
 * Revoke a user's access to all hotels
 */
export const revokeAllHotelsAccess = async (userId: number | string): Promise<{ success: boolean, message: string }> => {
  return apiDelete(`/user-hotels/all-access/users/${userId}`, 'Failed to revoke all hotels access');
}; 
import { apiGet, apiPost, apiDelete } from './apiClient';

// Types for approval system 

export type EntryType = 'hotel' | 'room' | 'event' | 'room_operations' | 'room_space' | 'event_space' | 'food_beverage';
export type PermissionType = 'view' | 'edit_all' | 'edit_assigned' | 'edit_with_approval';
export type ChangeStatus = 'pending' | 'approved' | 'rejected';

export interface PendingChange {
  id: number;
  entry_id: number;
  entry_type: EntryType;
  user_id: number;
  change_data: any;
  original_data: any;
  status: ChangeStatus;
  reviewed_by: number | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  submitter_first_name?: string;
  submitter_last_name?: string;
  submitter_email?: string;
  reviewer_first_name?: string;
  reviewer_last_name?: string;
}

export interface EntryAssignment {
  id: number;
  entry_id: number;
  entry_type: EntryType;
  user_id: number;
  assigned_by: number;
  created_at: string;
  assigned_by_first_name?: string;
  assigned_by_last_name?: string;
  hotel_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

// API endpoints

/**
 * Submit changes for approval
 */
export const submitChanges = async (
  entryId: number,
  entryType: EntryType,
  changeData: any,
  originalData: any
): Promise<{ success: boolean; changeId: number }> => {
  return apiPost('/approval/submit', {
    entryId,
    entryType,
    changeData,
    originalData
  }, 'Failed to submit changes for approval');
};

/**
 * Get pending changes awaiting approval
 */
export const getPendingChanges = async (
  status: ChangeStatus = 'pending',
  entryType?: EntryType,
  entryId?: number,
  userId?: number
): Promise<PendingChange[]> => {
  let endpoint = `/approval/pending?status=${status}`;
  
  if (entryType) endpoint += `&entryType=${entryType}`;
  if (entryId) endpoint += `&entryId=${entryId}`;
  if (userId) endpoint += `&userId=${userId}`;
  
  return apiGet(endpoint, 'Failed to fetch pending changes');
};

/**
 * Get a specific pending change by ID
 */
export const getPendingChangeById = async (id: number): Promise<PendingChange> => {
  return apiGet(`/approval/changes/${id}`, `Failed to fetch change with ID ${id}`);
};

/**
 * Review a pending change (approve or reject)
 */
export const reviewChange = async (
  id: number,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<{ success: boolean; status: ChangeStatus }> => {
  return apiPost(`/approval/changes/${id}/review`, {
    status,
    notes
  }, `Failed to ${status} change`);
};

/**
 * Get changes submitted by the current user
 */
export const getMyChanges = async (status?: ChangeStatus): Promise<PendingChange[]> => {
  let endpoint = '/approval/my-changes';
  if (status) endpoint += `?status=${status}`;
  
  return apiGet(endpoint, 'Failed to fetch your changes');
};

/**
 * Get entry assignments for a user
 */
export const getUserAssignments = async (userId: number): Promise<EntryAssignment[]> => {
  return apiGet(`/approval/assignments/users/${userId}`, `Failed to fetch assignments for user ${userId}`);
};

/**
 * Get users assigned to an entry
 */
export const getEntryAssignments = async (
  entryType: EntryType,
  entryId: number
): Promise<EntryAssignment[]> => {
  return apiGet(
    `/approval/assignments/entries/${entryType}/${entryId}`,
    `Failed to fetch users assigned to ${entryType} ${entryId}`
  );
};

/**
 * Assign an entry to a user
 */
export const assignEntry = async (
  userId: number,
  entryId: number,
  entryType: EntryType
): Promise<{ success: boolean }> => {
  return apiPost('/approval/assignments', {
    userId,
    entryId,
    entryType
  }, 'Failed to assign entry to user');
};

/**
 * Unassign an entry from a user
 */
export const unassignEntry = async (
  userId: number,
  entryType: EntryType,
  entryId: number
): Promise<{ success: boolean }> => {
  return apiDelete(
    `/approval/assignments/users/${userId}/entries/${entryType}/${entryId}`,
    'Failed to unassign entry from user'
  );
}; 
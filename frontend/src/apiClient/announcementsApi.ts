import { apiGet, apiPost, apiDelete } from './apiClient';

export interface Announcement {
  id: number;
  hotel_id: number;
  hotel_name: string;
  message: string;
  image_url?: string;
  assignee?: string;
}

// Homepage active announcements
export const getActiveAnnouncements = (): Promise<Announcement[]> => {
  return apiGet('/announcements/active', 'Failed to fetch announcements');
};

// Get announcement for specific hotel
export const getHotelAnnouncement = (hotelId: number): Promise<Announcement | null> => {
  return apiGet(`/hotels/${hotelId}/announcement`, 'Failed to fetch announcement');
};

// Upsert announcement for a hotel
export const upsertHotelAnnouncement = (
  hotelId: number,
  message: string,
  active = true
): Promise<{ success: boolean }> => {
  return apiPost(`/hotels/${hotelId}/announcement`, { message, active }, 'Failed to save announcement');
};

// Delete announcement for a hotel
export const deleteHotelAnnouncement = (hotelId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/hotels/${hotelId}/announcement`, 'Failed to delete announcement');
}; 
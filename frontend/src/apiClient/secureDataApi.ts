import { apiGet, apiPost } from './apiClient';

export interface SecureDataEntry {
  id: number;
  name: string;
  username: string;
  passwordMasked?: string; // only when listing
  password?: string; // when decrypted
}

// Fetch secure data list for a hotel (passwords masked)
export const getHotelSecureData = (hotelId: number): Promise<SecureDataEntry[]> => {
  return apiGet(`/hotels/${hotelId}/secure-data`, 'Failed to fetch secure data');
};

// Create a new secure data entry for a hotel
export const addHotelSecureData = (
  hotelId: number,
  payload: { name: string; username?: string; password: string }
): Promise<{ id: number }> => {
  return apiPost(`/hotels/${hotelId}/secure-data`, payload, 'Failed to add secure data');
};

// Fetch decrypted entry (will include clear password)
export const getSecureDataEntry = (entryId: number): Promise<SecureDataEntry> => {
  return apiGet(`/secure-data/${entryId}`, 'Failed to fetch secure data entry');
}; 
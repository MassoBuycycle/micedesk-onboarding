import { apiGet, apiPost, apiDelete } from './apiClient';

export interface FoodBeverageDetailsInput {
  // Keep flexible: any fields allowed by backend
  [key: string]: any;
}

export const upsertFoodBeverageDetails = async (
  hotelId: number,
  details: FoodBeverageDetailsInput
): Promise<{ success: boolean; data: any }> => {
  return apiPost(`/hotels/${hotelId}/fb/details`, details, 'Failed to save F&B details');
};

export const getFoodBeverageDetails = async (hotelId: number): Promise<any> => {
  return apiGet(`/hotels/${hotelId}/fb/details`, 'Failed to fetch F&B details');
};

export const deleteFoodBeverageDetails = async (hotelId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/hotels/${hotelId}/fb/details`, 'Failed to delete F&B details');
}; 
import { apiGet, apiPost, apiDelete } from './apiClient';
import { FoodBeverageDetails, Restaurant, Bar } from '@/types/foodBeverage';

export interface FoodBeverageDetailsInput extends Partial<FoodBeverageDetails> {
  restaurants?: Restaurant[];
  bars?: Bar[];
  // Keep flexible for any additional fields
  [key: string]: any;
}

export interface FoodBeverageDetailsResponse extends FoodBeverageDetails {
  restaurants: Restaurant[];
  bars: Bar[];
}

export const upsertFoodBeverageDetails = async (
  hotelId: number,
  details: FoodBeverageDetailsInput
): Promise<{ success: boolean; data: FoodBeverageDetailsResponse }> => {
  return apiPost(`/hotels/${hotelId}/fb/details`, details, 'Failed to save F&B details');
};

export const getFoodBeverageDetails = async (hotelId: number): Promise<FoodBeverageDetailsResponse> => {
  const response = await apiGet(`/hotels/${hotelId}/fb/details`, 'Failed to fetch F&B details');
  return response.data;
};

export const deleteFoodBeverageDetails = async (hotelId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/hotels/${hotelId}/fb/details`, 'Failed to delete F&B details');
};

export const getRestaurants = async (hotelId: number): Promise<Restaurant[]> => {
  const response = await apiGet(`/hotels/${hotelId}/fb/restaurants`, 'Failed to fetch restaurants');
  return response.data;
};

export const getBars = async (hotelId: number): Promise<Bar[]> => {
  const response = await apiGet(`/hotels/${hotelId}/fb/bars`, 'Failed to fetch bars');
  return response.data;
}; 
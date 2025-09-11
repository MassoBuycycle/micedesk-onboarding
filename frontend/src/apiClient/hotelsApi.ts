import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Schemas from OpenAPI spec for Hotels
export interface Hotel {
  id?: number;
  system_hotel_id?: string; // External system identifier (e.g. HB4I2, 57392, H5425)
  name?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  general_manager_name?: string;
  general_manager_phone?: string;
  general_manager_email?: string;
  billing_address_name?: string;
  billing_address_street?: string;
  billing_address_zip?: string;
  billing_address_city?: string;
  billing_address_vat?: string;
  star_rating?: number;
  category?: string;
  opening_date?: number;
  latest_renovation_date?: number;
  total_rooms?: number;
  conference_rooms?: number;
  pms_system?: string;
  no_of_parking_spaces?: number;
  no_of_parking_spaces_garage?: number;
  no_of_parking_spaces_electric?: number;
  no_of_parking_spaces_bus?: number;
  no_of_parking_spaces_outside?: number;
  no_of_parking_spaces_disabled?: number;
  parking_cost_per_hour?: number;
  parking_cost_per_day?: number;
  parking_remarks?: string;
  distance_to_airport_km?: number;
  distance_to_highway_km?: number;
  distance_to_fair_km?: number;
  distance_to_train_station?: number;
  distance_to_public_transport?: number;
  opening_time_pool?: string;
  opening_time_fitness_center?: string;
  opening_time_spa_area?: string;
  equipment_fitness_center?: string;
  equipment_spa_area?: string;
  planned_changes?: string;
  attraction_in_the_area?: string;
  additional_links?: Array<{ name?: string; link?: string }>;
  created_at?: string; // date-time
  updated_at?: string; // date-time
  // Added for overview convenience
  main_image_url?: string | null;
}

export interface HotelInput {
  system_hotel_id?: string; // External system identifier (e.g. HB4I2, 57392, H5425)
  name: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  description?: string;
  external_billing_id?: string;
  
  general_manager_name?: string;
  general_manager_phone?: string;
  general_manager_email?: string;

  billing_address_name?: string;
  billing_address_street?: string;
  billing_address_zip?: string;
  billing_address_city?: string;
  billing_address_vat?: string;

  star_rating?: number;
  category?: string;
  opening_year?: number;
  latest_renovation_year?: number;
  total_rooms?: number;
  conference_rooms?: number;
  pms_system?: string;

  distance_to_airport_km?: number;
  distance_to_highway_km?: number;
  distance_to_fair_km?: number;
  distance_to_train_station?: number;
  distance_to_public_transport?: number;

  no_of_parking_spaces?: number;
  no_of_parking_spaces_garage?: number;
  no_of_parking_spaces_electric?: number;
  no_of_parking_spaces_bus?: number;
  no_of_parking_spaces_outside?: number;
  no_of_parking_spaces_disabled?: number;
  parking_cost_per_hour?: number;
  parking_cost_per_day?: number;
  parking_remarks?: string;

  attraction_in_the_area?: string;
  planned_changes?: string;

  // Specific Facilities Info
  opening_time_pool?: string;
  opening_time_fitness_center?: string;
  equipment_fitness_center?: string;
  opening_time_spa_area?: string;
  equipment_spa_area?: string;
  additional_links?: Array<{ name?: string; link?: string }>;
}

// New Schemas for Food & Beverage Outlets
export interface FoodBeverageOutletInput {
  name: string;
  type?: string; 
  description?: string;
  opening_hours?: string;
}

export interface FoodBeverageOutlet {
  id?: number;
  hotel_id?: number;
  name?: string;
  type?: string;
  description?: string;
  opening_hours?: string;
  created_at?: string;
  updated_at?: string;
}

// API Endpoints for Hotels

/**
 * Get all hotels
 */
export const getAllHotels = async (): Promise<Hotel[]> => {
  try {
    const response = await apiGet('/hotels/overview', 'Failed to fetch hotels');
    // Safely return array, handle both direct array response and wrapped response
    const data = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
    return data as Hotel[];
  } catch (error) {
    // Return empty array on error to prevent undefined issues
    return [];
  }
};

/**
 * Create a new hotel
 */
export const createHotel = async (hotelData: HotelInput): Promise<{ success: true; hotelId: number; name: string; }> => {
  const responseBody = await apiPost('/hotels', hotelData, 'Failed to create hotel');

  if (responseBody.success && responseBody.data && typeof responseBody.data.hotelId === 'number') {
    return {
      success: true,
      hotelId: responseBody.data.hotelId,
      name: hotelData.name
    };
  } else {
    throw new Error('Failed to process hotel creation response: Unexpected data structure from server.');
  }
};

/**
 * Get hotel by ID
 */
export const getHotelById = async (id: number): Promise<Hotel> => {
  return apiGet(`/hotels/${id}`, `Failed to fetch hotel with id ${id}`);
};

/**
 * Update hotel
 */
export const updateHotel = async (id: number, hotelData: HotelInput): Promise<{ success: boolean; hotelId: number; hotel: Hotel }> => {
  return apiPut(`/hotels/${id}`, hotelData, `Failed to update hotel with id ${id}`);
};

/**
 * Delete hotel
 */
export const deleteHotel = async (id: number): Promise<{ success: boolean }> => {
  return apiDelete(`/hotels/${id}`, `Failed to delete hotel with id ${id}`);
};

// ---- Full Details ----

export interface FullHotelResponse {
  hotel: Hotel;
  rooms: any[];
  roomCategories: any[];
  roomOperational: any[];
  eventSpaces: any[];
  fnb: any;
  contacts: any;
  billing: any;
  parking: any;
  distances: any;
  files: import('./filesApi').FileData[];
}

export const getFullHotelDetails = async (id: number): Promise<FullHotelResponse> => {
  const result = await apiGet(`/hotels/${id}/full`, `Failed to fetch full details for hotel ${id}`);
  return result.data;
};

// ---- Food & Beverage API Endpoints ----

export const getFoodBeverageOutlets = async (hotelId: number): Promise<FoodBeverageOutlet[]> => {
  return apiGet(`/hotels/${hotelId}/foodbeverage`, `Failed to fetch F&B outlets for hotel ${hotelId}`);
};

export const createFoodBeverageOutlet = async (hotelId: number, data: FoodBeverageOutletInput): Promise<FoodBeverageOutlet> => {
  return apiPost(`/hotels/${hotelId}/foodbeverage`, data, `Failed to create F&B outlet for hotel ${hotelId}`);
};

export const getFoodBeverageOutletById = async (hotelId: number, outletId: number): Promise<FoodBeverageOutlet> => {
  return apiGet(`/hotels/${hotelId}/foodbeverage/${outletId}`, `Failed to fetch F&B outlet ${outletId} for hotel ${hotelId}`);
};

export const updateFoodBeverageOutlet = async (hotelId: number, outletId: number, data: FoodBeverageOutletInput): Promise<FoodBeverageOutlet> => {
  return apiPut(`/hotels/${hotelId}/foodbeverage/${outletId}`, data, `Failed to update F&B outlet ${outletId} for hotel ${hotelId}`);
};

export const deleteFoodBeverageOutlet = async (hotelId: number, outletId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/hotels/${hotelId}/foodbeverage/${outletId}`, `Failed to delete F&B outlet ${outletId} for hotel ${hotelId}`);
};

// ---- End Food & Beverage API Endpoints ----
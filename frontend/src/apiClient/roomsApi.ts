import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Schemas for Room Categories (Input and Response)
export interface RoomCategoryInput { // This is for ADDING categories to an existing room
  category_name: string;
  pms_name?: string;
  num_rooms?: number;
  size?: number;
  bed_type?: string;
  surcharges_upsell?: string;
  room_features?: string;
  second_person_surcharge?: number;
  extra_bed_surcharge?: number;
  baby_bed_available?: boolean;
  extra_bed_available?: boolean;
}

export interface RoomCategory { // This is the structure of a category when fetched
  id?: number;
  room_id?: number; 
  category_name?: string;
  pms_name?: string;
  // ... other fields matching RoomCategoryInput plus id, room_id, timestamps
  created_at?: string; 
  updated_at?: string; 
}

// This interface defines the structure for creating what was previously called a distinct "Room Type"
// It might still be useful if categories themselves have these top-level properties.
export interface StandaloneRoomTypeInput { // Renamed from RoomTypeInput
  hotel_id: number; 
  name: string; // e.g., "Standard Double", "Deluxe Suite"
  max_occupancy: number;
  base_price: number;
  description?: string;
  categories?: RoomCategoryInput[]; // Usually empty if creating the type first
}

// This is the general structure of a RoomType entity as returned by the backend (e.g. from a GET /rooms/:id)
export interface RoomType {
  id?: number;
  hotel_id?: number;
  name?: string; // This would be the name from StandaloneRoomTypeInput if it was used
  max_occupancy?: number;
  base_price?: number;
  description?: string;
  // Fields from the `rooms` table like main_contact_name etc. might also be here in a full RoomType GET response
  main_contact_name?: string;
  main_contact_position?: string;
  reception_hours?: string;
  created_at?: string; 
  updated_at?: string; 
  categories?: RoomCategory[]; // Categories associated with this room type
}


// NEW: Input for the main room configuration (contacts, policies, inventory, pet policy for the single rooms entry)
// This should align with data collected by RoomForm.tsx (RoomFormValues)
export interface MainRoomConfigInput {
  hotel_id: number; // Crucial: must be provided
  // Fields from ROOMS_BASE_FIELDS (backend)
  main_contact_name?: string;
  main_contact_position?: string;
  reception_hours?: string;
  // Fields from ROOM_CONTACTS_FIELDS (backend)
  phone?: string;
  email?: string;
  // Fields from ROOM_POLICIES_FIELDS (backend)
  check_in?: string; // Note: RoomForm.tsx might use check_in_time
  check_out?: string; // Note: RoomForm.tsx might use check_out_time
  early_check_in_cost?: number;
  late_check_out_cost?: number;
  early_check_in_time_frame?: string;
  late_check_out_time?: string; // Note: RoomForm.tsx might use late_check_out_tme
  payment_methods?: string[]; // Array of strings, will be JSONified by backend if needed
  // Fields from ROOM_INVENTORY_FIELDS (backend)
  amt_single_rooms?: number;
  amt_double_rooms?: number;
  amt_connecting_rooms?: number;
  amt_handicapped_accessible_rooms?: number;
  // Fields from ROOM_PET_POLICIES_FIELDS (backend)
  is_dogs_allowed?: boolean;
  dog_fee?: number;
  dog_fee_inclusions?: string;
  // Standard room features (missing from backend - needs to be added)
  standard_features?: string[];
  // Any other fields that RoomForm.tsx collects and should be saved with the main room config
}

// NEW: Expected response structure from createOrUpdateMainRoomConfig (backend)
export interface MainRoomConfigResponseData {
  roomId: number;
  hotel_id: number;
  main_contact_name?: string;
  main_contact_position?: string;
  reception_hours?: string;
  contacts?: { phone?: string; email?: string; };
  policies?: { 
    check_in?: string; 
    check_out?: string; 
    // ...other policy fields
  };
  inventory?: { 
    amt_single_rooms?: number; 
    // ...other inventory fields
  };
  pet_policies?: { 
    is_dogs_allowed?: boolean; 
    // ...other pet policy fields
  };
}


export interface RoomTypeUpdateInput { // This was for updating StandaloneRoomTypeInput
  name?: string;
  max_occupancy?: number;
  base_price?: number;
  description?: string;
  categories?: RoomCategoryInput[];
}

// ... (RoomTypeHandlingInput, RoomTypeHandling, RoomInfo, RoomInfoUpdateInput remain as they are for /info endpoint)
export interface RoomTypeHandlingInput {
  min_stay_days?: number | null;
  check_in_policy_notes?: string | null;
}
export interface RoomTypeHandling {
  id?: number;
  room_type_id?: number; 
  min_stay_days?: number | null;
  check_in_policy_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface RoomInfo { // For /rooms/info endpoint (hotel_info table)
  contact?: { name?: string; position?: string; phone?: string; email?: string; };
  check_in_out?: { check_in_time?: string; check_out_time?: string; early_check_in_time_frame?: string; early_check_in_fee?: number; late_check_out_time?: string; late_check_out_fee?: number; reception_hours?: string; };
  room_counts?: { single?: number; double?: number; connecting?: number; accessible?: number; };
  standard_features?: string[]; 
  payment_methods?: string[];
  pet_policy?: { pets_allowed?: boolean; pet_fee?: number; pet_inclusions?: string; };
  internetAvailable?: boolean;
  airConditioning?: boolean;
}
export type RoomInfoUpdateInput = Partial<Omit<RoomInfo, 'internetAvailable' | 'airConditioning'>>;

// Helper for error handling (if not already in a shared utility)
const handleResponseError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: defaultMessage }));
    throw new Error(errorData.error || defaultMessage);
  }
  return response.json();
};

// API Endpoints for Room Types (now mostly refers to the Main Room Config)

/**
 * Create or Update the Main Room Configuration for a hotel.
 * This now calls the backend's createOrUpdateMainRoomConfig.
 */
export const createRoom = async (mainRoomConfigData: MainRoomConfigInput): Promise<{ success: boolean; data: MainRoomConfigResponseData }> => {
  return apiPost('/rooms', mainRoomConfigData, 'Failed to save main room configuration');
};


// Deprecated or to be re-evaluated based on new model:
export const getAllRoomTypes = async (): Promise<RoomType[]> => {
  // This would need to fetch from /api/rooms and map to RoomType[] if still needed
  console.warn("getAllRoomTypes is likely deprecated or needs rework.");
  return Promise.resolve([]);
};

export const getRoomTypeById = async (id: number): Promise<RoomType | null> => {
  // This would fetch /api/rooms/:id
  console.warn("getRoomTypeById is likely deprecated or needs rework.");
  return Promise.resolve(null);
};

export const updateRoomType = async (id: number, roomTypeData: RoomTypeUpdateInput): Promise<{ success: boolean; roomTypeId: number; roomType: RoomType }> => {
  // This would PUT to /api/rooms/:id with RoomTypeUpdateInput (if still used for standalone types)
  console.warn("updateRoomType is likely deprecated or needs rework.");
  throw new Error("updateRoomType is deprecated");
};

export const deleteRoomType = async (id: number): Promise<{ success: boolean }> => {
  console.warn("deleteRoomType is likely deprecated or needs rework.");
  throw new Error("deleteRoomType is deprecated");
};

// API Endpoints for Room Info (/api/rooms/info - general hotel_info)
export const getRoomInfo = async (): Promise<RoomInfo> => {
  return apiGet('/rooms/info', 'Failed to fetch room info');
};

export const updateRoomInfo = async (roomInfoData: RoomInfoUpdateInput): Promise<RoomInfo> => {
  return apiPut('/rooms/info', roomInfoData, 'Failed to update room info');
};

// API Endpoints for Room Handling (associates with a specific roomId)
export const getRoomTypeHandling = async (roomTypeId: number): Promise<RoomTypeHandling> => {
  return apiGet(`/rooms/${roomTypeId}/handling`, `Failed to fetch room handling info for room type ${roomTypeId}`);
};

export const createOrUpdateRoomTypeHandling = async (roomTypeId: number, data: RoomTypeHandlingInput): Promise<{success: boolean; handling: RoomTypeHandling}> => {
  return apiPost(`/rooms/${roomTypeId}/handling`, data, `Failed to create or update room handling info for room type ${roomTypeId}`);
};

// API Endpoint for Adding Categories to a Room
export const addCategoriesToRoom = async (roomId: number, categories: RoomCategoryInput[]): Promise<{ success: boolean; createdCategories: RoomCategory[] }> => {
  return apiPost(`/rooms/${roomId}/categories`, categories, `Failed to add categories to room ${roomId}`);
};

// API Endpoint for Deleting a Room Category
export const deleteRoomCategory = async (categoryId: number): Promise<{ success: boolean }> => {
  return apiDelete(`/rooms/categories/${categoryId}`, `Failed to delete room category ${categoryId}`);
};

// API Endpoint for Getting Room Categories
export const getRoomCategories = async (roomId: number): Promise<RoomCategory[]> => {
  return apiGet(`/rooms/types/${roomId}/categories`, `Failed to fetch room categories for room ${roomId}`);
};

export interface RoomOperationalHandlingInput {
  revenue_manager_name?: string;
  revenue_contact_details?: string;
  demand_calendar?: boolean;
  demand_calendar_infos?: string;
  revenue_call?: boolean;
  revenue_calls_infos?: string;
  group_request_min_rooms?: number;
  group_reservation_category?: string;
  group_rates_check?: boolean;
  group_rates?: string;
  breakfast_share?: boolean;
  first_second_option?: boolean;
  shared_options?: boolean;
  first_option_hold_duration?: string;
  overbooking?: boolean;
  overbooking_info?: string;
  min_stay_weekends?: boolean;
  min_stay_weekends_infos?: string;
  call_off_quota?: boolean;
  call_off_method?: string;
  call_off_deadlines?: string;
  commission_rules?: string;
  free_spot_policy_leisure_groups?: string;
  restricted_dates?: string;
  handled_by_mice_desk?: boolean;
  requires_deposit?: boolean;
  deposit_rules?: string;
  payment_methods_room_handling?: string[];
  final_invoice_handling?: string;
  deposit_invoice_responsible?: string;
  info_invoice_created?: boolean;
}

// API Endpoints for Room Operational Handling
export const createOrUpdateRoomOperationalHandling = async (
  roomId: number,
  data: RoomOperationalHandlingInput
): Promise<{ success: boolean; handling: any }> => {
  return apiPost(`/rooms/${roomId}/handling`, data, `Failed to save operational handling for room ${roomId}`);
}; 
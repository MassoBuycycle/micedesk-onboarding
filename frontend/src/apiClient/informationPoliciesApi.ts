import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiClient';

// Types for Information Policies
export interface InformationPolicyItemDetail {
  id?: number;
  name: string;
  description?: string;
  default?: boolean;
}

export interface InformationPolicyItem {
  id?: number;
  title: string;
  is_condition: boolean;
  details: InformationPolicyItemDetail[];
}

export interface InformationPolicy {
  id?: number;
  system_hotel_id: string;
  type: 'room_information' | 'service_information' | 'general_policies';
  items: InformationPolicyItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateInformationPolicyInput {
  system_hotel_id: string;
  type: 'room_information' | 'service_information' | 'general_policies';
  items?: InformationPolicyItem[];
}

export interface UpdateInformationPolicyInput {
  type?: 'room_information' | 'service_information' | 'general_policies';
  items?: InformationPolicyItem[];
}

// API Functions
export const getInformationPoliciesByHotel = async (systemHotelId: string): Promise<InformationPolicy[]> => {
  try {
    const response = await apiGet(`/information-policies/hotel/${systemHotelId}`);
    // Safely extract data array, fallback to empty array if undefined
    return Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
  } catch (error) {
    // Return empty array on error to prevent undefined issues
    return [];
  }
};

export const getInformationPoliciesByType = async (
  hotelId: string, 
  type: string
): Promise<InformationPolicy[]> => {
  return await apiGet(`/information-policies/hotel/${hotelId}/type/${type}`, 'Failed to fetch information policies by type');
};

export const createInformationPolicy = async (
  data: CreateInformationPolicyInput
): Promise<{ success: boolean; data: { id: number; hotel_id: string; type: string }; message: string }> => {
  return await apiPost('/information-policies', data, 'Failed to create information policy');
};

export const updateInformationPolicy = async (
  id: number,
  data: UpdateInformationPolicyInput
): Promise<{ success: boolean; message: string }> => {
  return await apiPatch(`/information-policies/${id}`, data, 'Failed to update information policy');
};

export const deleteInformationPolicy = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  return await apiDelete(`/information-policies/${id}`, 'Failed to delete information policy');
}; 
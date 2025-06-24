import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

// Contract Details Types
export interface ContractDetails {
  id?: number;
  hotel_id?: number;
  
  // Contracting fields
  contract_model?: string;
  fte_count?: number;
  onboarding_date?: string; // Date string
  contract_start_date?: string; // Date string
  special_agreements?: string;
  
  // Technical Setup fields
  email_addresses_created?: boolean;
  access_pms_system?: boolean;
  access_sc_tool?: boolean;
  access_other_systems?: string[]; // Array of system names
  
  created_at?: string;
  updated_at?: string;
}

export interface ContractDetailsInput {
  contract_model?: string;
  fte_count?: number;
  onboarding_date?: string;
  contract_start_date?: string;
  special_agreements?: string;
  email_addresses_created?: boolean;
  access_pms_system?: boolean;
  access_sc_tool?: boolean;
  access_other_systems?: string[];
}

/**
 * Get contract details for a hotel
 */
export const getContractDetails = async (hotelId: number): Promise<ContractDetails> => {
  return apiGet(`/hotels/${hotelId}/contract`, `Failed to fetch contract details for hotel ${hotelId}`);
};

/**
 * Create or update contract details for a hotel
 */
export const upsertContractDetails = async (hotelId: number, data: ContractDetailsInput): Promise<{ success: boolean; data: ContractDetails; message: string }> => {
  return apiPost(`/hotels/${hotelId}/contract`, data, `Failed to save contract details for hotel ${hotelId}`);
};

/**
 * Update contract details (alias for upsert)
 */
export const updateContractDetails = async (hotelId: number, data: ContractDetailsInput): Promise<{ success: boolean; data: ContractDetails; message: string }> => {
  return apiPut(`/hotels/${hotelId}/contract`, data, `Failed to update contract details for hotel ${hotelId}`);
};

/**
 * Delete contract details
 */
export const deleteContractDetails = async (hotelId: number): Promise<{ success: boolean; message: string }> => {
  return apiDelete(`/hotels/${hotelId}/contract`, `Failed to delete contract details for hotel ${hotelId}`);
}; 
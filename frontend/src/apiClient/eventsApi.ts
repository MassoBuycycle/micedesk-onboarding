import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import { EventInput, EventBookingInput, EventOperationsInput, EventFinancialsInput, EventSpaceInput, EventEquipmentInput } from '@/types/events';

// New Schemas for Event Categories
export interface EventCategoryInput {
  // Define fields based on what 'EventCategoryForm.tsx' collects
  // Example fields - replace with actuals:
  name: string;
  description?: string;
}

export interface EventCategory {
  id?: number;
  event_id?: number; // Assuming it links to event_main.id
  name?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Schemas from OpenAPI spec for Events
export interface EventMain {
  id?: number;
  hotel_id?: number;
  hotel_name?: string; // Joined from hotels table
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_position?: string;
  categories?: EventCategory[]; // Added based on new API spec
  created_at?: string; // date-time
  updated_at?: string; // date-time
}

// MODIFIED EventMainInput
export interface EventMainInput {
  hotel_id: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_position?: string;
  categories?: EventCategoryInput[]; // Added: optional array of EventCategoryInput
}

export interface EventAvEquipment {
  id?: number;
  event_id?: number;
  equipment_name?: string;
  quantity?: number;
  price_per_unit?: number;
  created_at?: string; // date-time
  updated_at?: string; // date-time
}

export interface EventAvEquipmentInput {
  equipment_name: string;
  quantity?: number;
  price_per_unit?: number;
}

export interface EventAvEquipmentUpdateInput {
  equipment_name?: string;
  quantity?: number;
  price_per_unit?: number;
}

export interface EventContracting {
  id?: number;
  event_id?: number;
  contracted_companies?: string | null;
  refused_requests?: string | null;
  unwanted_marketing_tools?: string | null;
  first_second_option?: boolean;
  split_options?: boolean;
  option_hold_duration?: string | null;
  overbooking_policy?: boolean;
  deposit_required?: boolean;
  accepted_payment_methods?: string | null;
  commission_rules?: string | null;
  second_signature_required?: boolean;
  created_at?: string; // date-time
  updated_at?: string; // date-time
}

export interface EventContractingInput {
  contracted_companies?: string | null;
  refused_requests?: string | null;
  unwanted_marketing_tools?: string | null;
  first_second_option?: boolean;
  split_options?: boolean;
  option_hold_duration?: string | null;
  overbooking_policy?: boolean;
  deposit_required?: boolean;
  accepted_payment_methods?: string | null;
  commission_rules?: string | null;
  second_signature_required?: boolean;
}

export interface EventTechnical {
  id?: number;
  event_id?: number;
  beamer_lumens?: string | null;
  copy_cost?: number;
  software_presentation?: string | null;
  wifi_data_rate?: string | null;
  has_ac_or_ventilation?: boolean;
  has_blackout_curtains?: boolean;
  is_soundproof?: boolean;
  has_daylight?: boolean;
  is_hybrid_meeting_possible?: boolean;
  technical_support_available?: boolean;
  created_at?: string; // date-time
  updated_at?: string; // date-time
}

export interface EventTechnicalInput {
  beamer_lumens?: string | null;
  copy_cost?: number;
  software_presentation?: string | null;
  wifi_data_rate?: string | null;
  has_ac_or_ventilation?: boolean;
  has_blackout_curtains?: boolean;
  is_soundproof?: boolean;
  has_daylight?: boolean;
  is_hybrid_meeting_possible?: boolean;
  technical_support_available?: boolean;
}

export interface EventHandling {
  id?: number;
  event_id?: number;
  sold_with_rooms_only?: boolean;
  last_minute_lead_time?: string | null;
  sent_over_time_material?: boolean;
  lunch_location?: string | null;
  min_participants_package?: number;
  coffee_break_location?: string | null;
  advance_days_for_material?: number;
  room_drop_cost?: number;
  hotel_exclusive_clients?: boolean;
  minimum_spent?: boolean;
  storage_room?: boolean;
  deposit_needed_event?: boolean;
  deposit_rules_event?: string | null;
  deposit_invoice_creator?: string | null;
  informational_invoice_created?: boolean;
  payment_methods_events?: Record<string, boolean> | null; // JSON object e.g. { credit_card: true }
  final_invoice_handling_event?: string | null;
  created_at?: string; // date-time
  updated_at?: string; // date-time
}

export interface EventHandlingInput {
  sold_with_rooms_only?: boolean;
  last_minute_lead_time?: string | null;
  sent_over_time_material?: boolean;
  lunch_location?: string | null;
  min_participants_package?: number;
  coffee_break_location?: string | null;
  advance_days_for_material?: number;
  room_drop_cost?: number;
  hotel_exclusive_clients?: boolean;
  minimum_spent?: boolean;
  storage_room?: boolean;
  deposit_needed_event?: boolean;
  deposit_rules_event?: string | null;
  deposit_invoice_creator?: string | null;
  informational_invoice_created?: boolean;
  payment_methods_events?: Record<string, boolean> | null;
  final_invoice_handling_event?: string | null;
}

// Helper for error handling
const handleResponseError = async (response: Response, defaultMessage: string) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: defaultMessage }));
    throw new Error(errorData.error || defaultMessage);
  }
  return response.json();
};

// API Endpoints for Events

export const getAllEvents = async (): Promise<EventMain[]> => {
  return apiGet('/events', 'Failed to fetch events');
};

export const createEvent = async (data: EventInput): Promise<{ eventId: number }> => {
  console.log("==== createEvent API CALL ====");
  console.log("API URL:", `/events`);
  console.log("Request data:", data);
  
  try {
    const responseData = await apiPost('/events', data, 'Failed to create event');
    console.log("API Response data:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in createEvent API call:", error);
    throw error;
  }
};

export const getEventsByHotelId = async (hotelId: number): Promise<EventMain[]> => {
  return apiGet(`/events/hotel/${hotelId}`, `Failed to fetch events for hotel ${hotelId}`);
};

export const getEventById = async (id: number): Promise<EventMain> => {
  return apiGet(`/events/${id}`, `Failed to fetch event with id ${id}`);
};

export const updateEvent = async (id: number, eventData: EventMainInput): Promise<{ success: boolean; eventId: number; event: EventMain }> => {
  return apiPut(`/events/${id}`, eventData, `Failed to update event with id ${id}`);
};

export const deleteEvent = async (id: number): Promise<{ success: boolean }> => {
  return apiDelete(`/events/${id}`, `Failed to delete event with id ${id}`);
};

// AV Equipment
export const getEventAvEquipment = async (eventId: number): Promise<EventAvEquipment[]> => {
  return apiGet(`/events/${eventId}/equipment`, `Failed to fetch AV equipment for event ${eventId}`);
};

export const createEventAvEquipment = async (eventId: number, equipmentData: EventAvEquipmentInput): Promise<{ success: boolean; equipmentId: number; equipment: EventAvEquipment }> => {
  return apiPost(`/events/${eventId}/equipment`, equipmentData, `Failed to create AV equipment for event ${eventId}`);
};

export const bulkCreateEventAvEquipment = async (eventId: number, data: { event_id: number; equipment: EventAvEquipmentInput[] }): Promise<{ success: boolean; equipment: EventAvEquipment[] }> => {
  return apiPost(`/events/${eventId}/equipment/bulk`, data, `Failed to bulk create AV equipment for event ${eventId}`);
};

export const getAvEquipmentById = async (id: number): Promise<EventAvEquipment> => {
  return apiGet(`/events/equipment/${id}`, `Failed to fetch AV equipment with id ${id}`);
};

export const updateAvEquipment = async (id: number, equipmentData: EventAvEquipmentUpdateInput): Promise<{ success: boolean; equipmentId: number; equipment: EventAvEquipment }> => {
  return apiPut(`/events/equipment/${id}`, equipmentData, `Failed to update AV equipment with id ${id}`);
};

export const deleteAvEquipment = async (id: number): Promise<{ success: boolean }> => {
  return apiDelete(`/events/equipment/${id}`, `Failed to delete AV equipment with id ${id}`);
};

// Contracting Info
export const getEventContractingInfo = async (eventId: number): Promise<EventContracting> => {
  return apiGet(`/events/${eventId}/contracting`, `Failed to fetch contracting info for event ${eventId}`);
};

export const createOrUpdateEventContractingInfo = async (eventId: number, contractingData: EventContractingInput): Promise<{ success: boolean; contracting: EventContracting }> => {
  return apiPost(`/events/${eventId}/contracting`, contractingData, `Failed to create/update contracting info for event ${eventId}`);
};

// Technical Info
export const getEventTechnicalInfo = async (eventId: number): Promise<EventTechnical> => {
  return apiGet(`/events/${eventId}/technical`, `Failed to fetch technical info for event ${eventId}`);
};

export const createOrUpdateEventTechnicalInfo = async (eventId: number, technicalData: EventTechnicalInput): Promise<{ success: boolean; technical: EventTechnical }> => {
  return apiPost(`/events/${eventId}/technical`, technicalData, `Failed to create/update technical info for event ${eventId}`);
};

// Handling Info
export const getEventHandlingInfo = async (eventId: number): Promise<EventHandling> => {
  return apiGet(`/events/${eventId}/handling`, `Failed to fetch handling info for event ${eventId}`);
};

export const createOrUpdateEventHandlingInfo = async (eventId: number, handlingData: EventHandlingInput): Promise<{ success: boolean; handling: EventHandling }> => {
  return apiPost(`/events/${eventId}/handling`, handlingData, `Failed to create/update handling info for event ${eventId}`);
};

// Booking Info
export const getEventBooking = async (eventId: number): Promise<EventBookingInput> => {
  return apiGet(`/events/${eventId}/booking`, `Failed to fetch booking info for event ${eventId}`);
};

export const upsertBooking = async (eventId: number, data: EventBookingInput) => {
  return apiPost(`/events/${eventId}/booking`, data, 'Failed to save booking');
};

// Operations Info
export const getEventOperations = async (eventId: number): Promise<EventOperationsInput> => {
  return apiGet(`/events/${eventId}/operations`, `Failed to fetch operations info for event ${eventId}`);
};

export const upsertOperations = async (eventId: number, data: EventOperationsInput) => {
  return apiPost(`/events/${eventId}/operations`, data, 'Failed to save operations');
};

// Financials Info
export const getEventFinancials = async (eventId: number): Promise<EventFinancialsInput> => {
  return apiGet(`/events/${eventId}/financials`, `Failed to fetch financials info for event ${eventId}`);
};

export const upsertFinancials = async (eventId: number, data: EventFinancialsInput) => {
  return apiPost(`/events/${eventId}/financials`, { ...data, payment_methods: data.payment_methods }, 'Failed to save financials');
};

export const upsertSpaces = async (eventId: number, spaces: EventSpaceInput[]) => {
  return apiPost(`/events/${eventId}/spaces`, spaces, 'Failed to save spaces');
};

export const upsertEquipment = async (eventId: number, equip: EventEquipmentInput[]) => {
  return apiPost(`/events/${eventId}/equipment`, equip, 'Failed to save equipment');
}; 
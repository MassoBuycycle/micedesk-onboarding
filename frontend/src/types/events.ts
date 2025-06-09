export interface EventInput {
  hotel_id: number;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  contact_position?: string;
}

export interface EventBookingInput {
  has_options?: boolean;
  allows_split_options?: boolean;
  option_duration?: string;
  allows_overbooking?: boolean;
  rooms_only?: boolean;
  last_minute_leadtime?: string;
  contracted_companies?: string;
  refused_requests?: string;
  unwanted_marketing?: string;
  requires_second_signature?: boolean;
  exclusive_clients?: boolean;
}

export interface EventOperationsInput {
  // Fields from original event_operations
  has_overtime_material?: boolean;
  lunch_location?: string;
  min_participants?: number;
  coffee_location?: string;
  material_advance_days?: number;
  room_drop_fee?: number;
  has_storage?: boolean;
  has_minimum_spent?: boolean;
  
  // Fields from event_handling
  sold_with_rooms_only?: boolean;
  last_minute_lead_time?: string;
  sent_over_time_material?: boolean;
  min_participants_package?: number;
  coffee_break_location?: string;
  advance_days_for_material?: number;
  room_drop_cost?: number;
  hotel_exclusive_clients?: boolean;
  minimum_spent?: boolean;
  storage_room?: boolean;
  deposit_needed_event?: boolean;
  deposit_rules_event?: string;
  deposit_invoice_creator?: string;
  informational_invoice_created?: boolean;
  payment_methods_events?: string[];
  final_invoice_handling_event?: string;
}

export interface EventFinancialsInput {
  requires_deposit?: boolean;
  deposit_rules?: string;
  deposit_invoicer?: string;
  has_info_invoice?: boolean;
  payment_methods?: string[];
  invoice_handling?: string;
  commission_rules?: string;
  has_minimum_spent?: boolean;
}

export interface EventSpaceInput {
  name: string;
  daily_rate?: number;
  half_day_rate?: number;
  size?: string;
  dimensions?: string;
  cap_rounds?: number;
  cap_theatre?: number;
  cap_classroom?: number;
  cap_u_shape?: number;
  cap_boardroom?: number;
  cap_cabaret?: number;
  cap_cocktail?: number;
  features?: string;
  is_soundproof?: boolean;
  has_daylight?: boolean;
  has_blackout?: boolean;
  has_climate_control?: boolean;
  wifi_speed?: string;
  beamer_lumens?: number;
  supports_hybrid?: boolean;
  presentation_software?: string;
  copy_fee?: number;
  has_tech_support?: boolean;
}

export interface EventEquipmentInput {
  equipment_name: string;
  quantity?: number;
  price?: number;
}

export interface EventTechnicalInput {
  beamer_lumens?: string;
  copy_cost?: number;
  wifi_data_rate?: string;
  software_presentation?: string;
  has_ac_or_ventilation?: boolean;
  has_blackout_curtains?: boolean;
  is_soundproof?: boolean;
  has_daylight?: boolean;
  is_hybrid_meeting_possible?: boolean;
  technical_support_available?: boolean;
}

export interface EventContractingInput {
  contracted_companies?: string;
  refused_requests?: string;
  unwanted_marketing_tools?: string;
  first_second_option?: boolean;
  split_options?: boolean;
  option_hold_duration?: string;
  overbooking_policy?: boolean;
  deposit_required?: boolean;
  accepted_payment_methods?: string;
  commission_rules?: string;
  second_signature_required?: boolean;
} 
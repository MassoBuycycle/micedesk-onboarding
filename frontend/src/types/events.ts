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
  sent_over_time_material?: boolean;
  has_storage?: boolean;
  sold_with_rooms_only?: boolean;
  hotel_exclusive_clients?: boolean;
  exclusive_clients_info?: string;
  has_minimum_spent?: boolean;
  minimum_spent_info?: string;
  deposit_needed_event?: boolean;
  informational_invoice_created?: boolean;
  lunch_location?: string;
  coffee_break_location?: string;
  last_minute_lead_time?: string;
  deposit_invoice_creator?: string;
  min_participants_package?: number;
  /**
   * Vorlaufzeit Material – wird nun als Freitext im bestehenden Feld geführt
   */
  advance_days_for_material?: any;
  room_drop_cost?: number;
  deposit_rules_event?: string;
  payment_methods_events?: string[];
  final_invoice_handling_event?: string;
  /** Einlagerung kostenfrei? */
  storage_free_of_charge?: boolean;
  /** Preisinfo falls Einlagerung nicht kostenfrei */
  storage_pricing_info?: string;
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
  /**
   * Preferred field matching backend column name
   */
  price_per_unit?: number;
  /**
   * Legacy alias used in some form code; still accepted by backend
   */
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
  technical_notes?: string;
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
  accepted_payment_methods?: string[];
  commission_rules?: string;
  second_signature_required?: boolean;
} 
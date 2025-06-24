export interface RoomOperationalHandling {
  id?: number;
  room_id: number;
  revenue_manager_name: string;
  revenue_contact_details: string;
  demand_calendar: boolean;
  demand_calendar_infos: string;
  revenue_call: boolean;
  revenue_calls_infos: string;
  group_request_min_rooms: number;
  group_reservation_category: string;
  group_rates_check: boolean;
  group_rates: string;
  group_handling_notes: string;
  breakfast_share: boolean;
  first_second_option: boolean;
  shared_options: boolean;
  first_option_hold_duration: string;
  overbooking: boolean;
  overbooking_info: string;
  min_stay_weekends: boolean;
  min_stay_weekends_infos: string;
  call_off_quota: boolean;
  call_off_method: string;
  call_off_deadlines: string;
  commission_rules: string;
  free_spot_policy_leisure_groups: string;
  restricted_dates: string;
  handled_by_mice_desk: boolean;
  mice_desk_handling_scope: string;
  requires_deposit: boolean;
  deposit_rules: string;
  payment_methods_room_handling: string; // JSON string
  final_invoice_handling: string;
  deposit_invoice_responsible: string;
  info_invoice_created: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type RoomOperationalHandlingInput = Omit<RoomOperationalHandling, 'id' | 'created_at' | 'updated_at'>; 
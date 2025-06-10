export interface Room {
  id: number;
  hotel_id: number;
  main_contact_name: string;
  reception_hours: string;
  created_at?: Date;
  main_contact_name?: string;
  main_contact_position?: string;
  phone?: string;
  email?: string;
  check_in?: string;
  check_out?: string;
  early_check_in_cost?: number;
  late_check_out_cost?: number;
  early_check_in_time_frame?: string;
  late_check_out_tme?: string;
  reception_hours?: string;
  payment_methods?: string; // JSON string
  amt_single_rooms?: number;
  amt_double_rooms?: number;
  amt_connecting_rooms?: number;
  amt_handicapped_accessible_rooms?: number;
  is_dogs_allowed?: boolean;
  dog_fee?: number;
  dog_fee_inclusions?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RoomStandardFeatures {
  id?: number;
  room_id: number;
  shower_toilet: boolean;
  bathtub_toilet: boolean;
  open_bathroom: boolean;
  balcony: boolean;
  safe: boolean;
  air_condition: boolean;
  heating: boolean;
  hair_dryer: boolean;
  ironing_board: boolean;
  tv: boolean;
  telefon: boolean;
  wifi: boolean;
  desk: boolean;
  coffee_maker: boolean;
  kettle: boolean;
  minibar: boolean;
  fridge: boolean;
  allergy_friendly_bed_linen: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MainRoomConfigInput {
  hotel_id: number;
  main_contact_name?: string;
  reception_hours?: string;
  phone?: string;
  email?: string;
  check_in?: string;
  check_out?: string;
  early_check_in_cost?: number;
  late_check_out_cost?: number;
  early_check_in_time_frame?: string;
  late_check_out_time?: string;
  payment_methods?: string; // JSON string
  amt_single_rooms?: number;
  amt_double_rooms?: number;
  amt_connecting_rooms?: number;
  amt_handicapped_accessible_rooms?: number;
  is_dogs_allowed?: boolean;
  dog_fee?: number;
  dog_fee_inclusions?: string;
  standard_features?: string[];
}

export interface RoomCategoryInput {
  category_name?: string;
  // ... existing code ...
} 
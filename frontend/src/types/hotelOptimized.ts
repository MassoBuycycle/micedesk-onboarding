export interface Hotel {
  id?: number;
  name: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  star_rating: number;
  category?: string;
  director_name?: string;
  opening_date?: Date;
  latest_renovation_date?: Date;
  total_rooms?: number;
  conference_rooms?: number;
  pms_system?: string;
  check_in_from?: string;
  check_out_until?: string;
  pets_allowed?: boolean;
  hotel_chain?: string;
  hotel_brand?: string;
  planned_changes?: string;
  attraction_in_the_area?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface HotelContact {
  id?: number;
  hotel_id: number;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface HotelBilling {
  id?: number;
  hotel_id: number;
  billing_address_name?: string;
  billing_address_street?: string;
  billing_address_zip?: string;
  billing_address_city?: string;
  billing_address_vat: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface HotelDistance {
  id?: number;
  hotel_id: number;
  distance_to_airport_km?: number;
  distance_to_highway_km?: number;
  distance_to_fair_km?: number;
  distance_to_train_station?: number;
  distance_to_public_transport?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface HotelParking {
  id?: number;
  hotel_id: number;
  no_of_parking_spaces?: number;
  no_of_parking_spaces_garage?: number;
  no_of_parking_spaces_electric?: number;
  no_of_parking_spaces_bus?: number;
  no_of_parking_spaces_outside?: number;
  no_of_parking_spaces_disabled?: number;
  parking_cost_per_hour?: number;
  parking_cost_per_day?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AmenityType {
  id?: number;
  name: string;
}

export interface HotelAmenity {
  hotel_id: number;
  amenity_id: number;
  details?: string;
  opening_hours?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Combined interface for handling hotel creation with all related entities
export interface HotelComplete {
  hotel: Hotel;
  contact?: HotelContact;
  billing?: HotelBilling;
  distances?: HotelDistance;
  parking?: HotelParking;
  amenities?: {
    amenityId: number;
    details?: string;
    openingHours?: string;
  }[];
} 
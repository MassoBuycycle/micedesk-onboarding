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
  telephone: boolean;
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
export interface RoomCategoryInfo {
  id?: number;
  room_id: number;
  category_name: string;
  pms_name: string;
  num_rooms: number;
  size: number;
  bed_type: string;
  surcharges_upsell: string;
  room_features: string;
  second_person_surcharge: number;
  extra_bed_surcharge: number;
  baby_bed_available: boolean;
  extra_bed_available: boolean;
  created_at?: Date;
  updated_at?: Date;
} 
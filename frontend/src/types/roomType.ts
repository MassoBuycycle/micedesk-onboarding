import { RoomCategoryInfo } from './roomCategory.js';

export interface RoomType {
  id?: number;
  name: string;
  max_occupancy: number;
  base_price: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  categories?: RoomCategoryInfo[];
}

export interface RoomTypeResponse {
  id: number;
  name: string;
  max_occupancy: number;
  base_price: number;
  description: string;
  created_at: string;
  updated_at: string;
  categories: RoomCategoryInfo[];
}

export interface RoomTypeCreateResponse {
  success: boolean;
  roomTypeId: number;
  roomType: RoomTypeResponse;
}

export interface RoomTypeUpdateResponse {
  success: boolean;
  roomTypeId: number;
  roomType: RoomTypeResponse;
} 
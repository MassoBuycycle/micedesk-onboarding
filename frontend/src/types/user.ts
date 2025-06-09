export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateResponse {
  success: boolean;
  userId: number;
  user: UserResponse;
}

export interface UserUpdateResponse {
  success: boolean;
  userId: number;
  user: UserResponse;
}

export interface DeleteResponse {
  success: boolean;
} 
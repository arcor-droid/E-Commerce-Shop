export type UserRole = 'customer' | 'admin';

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  street_address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string; // email or nickname
  password: string;
}

export interface RegisterRequest {
  email: string;
  nickname: string;
  password: string;
  password_confirm: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserUpdateRequest {
  email?: string;
  nickname?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  payment_method?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

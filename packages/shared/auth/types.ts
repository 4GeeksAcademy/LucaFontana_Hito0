export type UserRole = "admin" | "manager" | "user";

export type Profile = {
  id: number;
  user_id: number;
  name: string | null;
  phone: string | null;
  address: string | null;
};

export type AuthUser = {
  id: number;
  email: string;
  is_active: boolean;
  role: UserRole;
  created_at: string;
  profile: Profile | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  address?: string;
};

export type ProfileUpdatePayload = {
  name?: string;
  phone?: string;
  address?: string;
};

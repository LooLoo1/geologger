// Re-export types from shared package for convenience
export type {
  User,
  CreateUserData,
  UserWithoutPassword,
} from '@geologger/libs/types/auth';

// Internal Supabase mapping types
export type SupabaseUser = {
  id: string;
  email: string;
  password: string;
  created_at: string;
  updated_at: string;
};

export type SupabaseUserWithoutPassword = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};


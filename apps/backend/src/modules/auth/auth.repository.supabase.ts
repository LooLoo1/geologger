import { supabase } from '@lib/supabase';
import { getSupabaseData } from '@lib/supabase.helpers';
import type {
  CreateUserData,
  UserWithoutPassword,
  User,
  SupabaseUser,
  SupabaseUserWithoutPassword,
} from './auth.types';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const response = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (response.error) {
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Supabase error: ${response.error.message}`);
    }

    if (!response.data) {
      return null;
    }

    return this.fromSupabase(response.data);
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    const response = await supabase
      .from('users')
      .select('id, email, created_at, updated_at')
      .eq('id', id)
      .single();

    if (response.error) {
      if (response.error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Supabase error: ${response.error.message}`);
    }

    if (!response.data) {
      return null;
    }

    return this.fromSupabaseWithoutPassword(response.data);
  }

  async create(data: CreateUserData): Promise<UserWithoutPassword> {
    const now = new Date().toISOString();
    const supabaseData = {
      email: data.email,
      password: data.password,
      created_at: now,
      updated_at: now,
    };

    const response = await supabase
      .from('users')
      .insert(supabaseData)
      .select('id, email, created_at, updated_at')
      .single();

    const created = getSupabaseData(response);
    return this.fromSupabaseWithoutPassword(created);
  }

  async exists(email: string): Promise<boolean> {
    const response = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    return response.data !== null && !response.error;
  }

  private fromSupabase(user: SupabaseUser): User {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }

  private fromSupabaseWithoutPassword(user: SupabaseUserWithoutPassword): UserWithoutPassword {
    return {
      id: user.id,
      email: user.email,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    };
  }
}



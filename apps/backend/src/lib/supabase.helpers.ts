import { supabase, supabaseAdmin, type SupabaseClient } from './supabase';

/**
 * Допоміжні функції для роботи з Supabase
 */

/**
 * Отримує клієнт Supabase для використання в репозиторіях
 * @param useAdmin - чи використовувати admin клієнт (для операцій, що потребують повних прав)
 * @returns SupabaseClient
 */
export function getSupabaseClient(useAdmin = false): SupabaseClient {
  if (useAdmin) {
    if (!supabaseAdmin) {
      throw new Error(
        'Supabase admin client is not available. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
      );
    }
    return supabaseAdmin;
  }
  return supabase;
}

/**
 * Обробка помилок Supabase
 */
export function handleSupabaseError(error: unknown): never {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  throw new Error('Unknown Supabase error');
}

/**
 * Перевірка чи є помилка в відповіді Supabase
 */
export function hasSupabaseError<T>(
  response: { data: T | null; error: unknown }
): response is { data: null; error: { message?: string } } {
  return response.error !== null;
}

/**
 * Безпечне отримання даних з відповіді Supabase
 */
export function getSupabaseData<T>(response: { data: T | null; error: unknown }): T {
  if (hasSupabaseError(response)) {
    const errorMessage =
      response.error && typeof response.error === 'object' && 'message' in response.error
        ? String(response.error.message)
        : 'Unknown Supabase error';
    throw new Error(`Supabase error: ${errorMessage}`);
  }
  if (response.data === null) {
    throw new Error('Supabase returned null data');
  }
  return response.data;
}


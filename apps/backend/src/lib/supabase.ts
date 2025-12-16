import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Завантажуємо .env файл на початку модуля
// Це гарантує, що змінні оточення будуть доступні до ініціалізації клієнта
// dotenv.config() шукає .env в поточній робочій директорії (apps/backend)
dotenv.config();

// Типи для конфігурації Supabase
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string; // Опціонально для server-side операцій
}

// Отримуємо конфігурацію з environment variables
const getSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Діагностика для відлагодження
  if (!url || !anonKey) {
    console.error('❌ Supabase configuration error:');
    console.error(`   SUPABASE_URL: ${url ? '✅ Set' : '❌ Missing'}`);
    console.error(`   SUPABASE_ANON_KEY: ${anonKey ? '✅ Set' : '❌ Missing'}`);
    console.error(`   Current working directory: ${process.cwd()}`);
    console.error(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    throw new Error(
      'Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables in .env file.'
    );
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
};

// Глобальний кеш для development (аналогічно до Prisma)
const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined;
  supabaseAdmin: SupabaseClient | undefined;
};

// Основной клієнт (використовує anon key)
export const supabase: SupabaseClient =
  globalForSupabase.supabase ??
  (() => {
    const config = getSupabaseConfig();
    return createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false, // Для server-side не потрібна персистентність сесії
        autoRefreshToken: false,
      },
    });
  })();

// Admin клієнт (використовує service role key для операцій, що потребують повних прав)
export const supabaseAdmin: SupabaseClient | null =
  globalForSupabase.supabaseAdmin ??
  (() => {
    const config = getSupabaseConfig();
    if (!config.serviceRoleKey) {
      return null;
    }
    return createClient(config.url, config.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  })();

// Кешуємо в development для hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
  if (supabaseAdmin) {
    globalForSupabase.supabaseAdmin = supabaseAdmin;
  }
}

// Експортуємо тип для використання в інших модулях
export type { SupabaseClient };


#!/usr/bin/env tsx
/**
 * Скрипт для перевірки налаштування змінних оточення Supabase
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Завантажуємо .env файл
const envPath = join(__dirname, '.env');
console.log(`📁 Шукаємо .env файл: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Помилка завантаження .env файлу:', result.error.message);
  console.log('\n💡 Створіть файл .env в директорії apps/backend/ з наступним вмістом:');
  console.log(`
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  `);
  process.exit(1);
}

console.log('✅ .env файл знайдено та завантажено\n');

// Перевіряємо змінні оточення
const requiredVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

console.log('🔍 Перевірка змінних оточення:\n');

let allValid = true;

// Перевірка SUPABASE_URL
if (!requiredVars.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL: відсутня');
  allValid = false;
} else {
  const isValidUrl = requiredVars.SUPABASE_URL.startsWith('https://') && 
                     requiredVars.SUPABASE_URL.includes('.supabase.co');
  console.log(`✅ SUPABASE_URL: ${isValidUrl ? 'валідна' : 'невалідна'} (${requiredVars.SUPABASE_URL.substring(0, 30)}...)`);
}

// Перевірка SUPABASE_ANON_KEY
if (!requiredVars.SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY: відсутня');
  allValid = false;
} else {
  const keyLength = requiredVars.SUPABASE_ANON_KEY.length;
  const isValidKey = keyLength > 50; // Supabase keys зазвичай довгі
  console.log(`✅ SUPABASE_ANON_KEY: ${isValidKey ? 'валідна' : 'можливо невалідна'} (довжина: ${keyLength} символів)`);
}

// Перевірка SUPABASE_SERVICE_ROLE_KEY (опціональна)
if (!requiredVars.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY: відсутня (опціональна, але рекомендована для admin операцій)');
} else {
  const keyLength = requiredVars.SUPABASE_SERVICE_ROLE_KEY.length;
  const isValidKey = keyLength > 50;
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${isValidKey ? 'валідна' : 'можливо невалідна'} (довжина: ${keyLength} символів)`);
}

console.log('\n' + '='.repeat(50));

if (!allValid) {
  console.error('\n❌ Деякі обов\'язкові змінні оточення відсутні!');
  console.log('\n📖 Інструкції:');
  console.log('1. Створіть проєкт на https://supabase.com/');
  console.log('2. Перейдіть до Settings → API');
  console.log('3. Скопіюйте Project URL та ключі');
  console.log('4. Створіть файл .env в apps/backend/ з цими значеннями');
  process.exit(1);
}

// Спробуємо імпортувати та ініціалізувати Supabase клієнт
console.log('\n🔌 Спробуємо ініціалізувати Supabase клієнт...\n');

try {
  const { supabase, supabaseAdmin } = await import('./src/lib/supabase.js');
  
  console.log('✅ Supabase клієнт успішно ініціалізовано');
  console.log(`✅ Admin клієнт: ${supabaseAdmin ? 'доступний' : 'недоступний (SUPABASE_SERVICE_ROLE_KEY не встановлено)'}`);
  
  // Простий тест підключення
  console.log('\n🧪 Тестуємо підключення до Supabase...');
  const testResponse = await supabase.from('users').select('id').limit(1);
  
  if (testResponse.error) {
    console.error('❌ Помилка підключення:', testResponse.error.message);
    console.error('   Код:', testResponse.error.code);
    if (testResponse.error.hint) {
      console.error('   Підказка:', testResponse.error.hint);
    }
    console.log('\n💡 Можливі причини:');
    console.log('   - Неправильний SUPABASE_URL');
    console.log('   - Неправильний SUPABASE_ANON_KEY');
    console.log('   - Таблиця "users" не існує в базі даних');
    console.log('   - Проблеми з мережею');
    process.exit(1);
  } else {
    console.log('✅ Підключення успішне!');
    console.log('✅ Таблиця "users" існує та доступна');
  }
  
  console.log('\n✅ Всі перевірки пройдено успішно!');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Помилка ініціалізації Supabase клієнта:');
  if (error instanceof Error) {
    console.error('   ', error.message);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('\n   Stack trace:');
      console.error(error.stack);
    }
  } else {
    console.error('   Невідома помилка:', error);
  }
  process.exit(1);
}


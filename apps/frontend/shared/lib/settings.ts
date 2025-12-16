// Утиліти для збереження налаштувань у localStorage

const STORAGE_KEYS = {
  TIME_PERIOD: 'geologger_time_period',
  DETAIL_LEVEL: 'geologger_detail_level',
  REFETCH_INTERVAL: 'geologger_refetch_interval',
} as const;

export type TimePeriod = '15min' | '1hour' | '3hours' | '9hours' | 'day' | 'all';

export const TIME_PERIOD_OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: '15min', label: '15 хвилин' },
  { value: '1hour', label: 'Година' },
  { value: '3hours', label: '3 години' },
  { value: '9hours', label: '9 годин' },
  { value: 'day', label: 'День' },
  { value: 'all', label: 'Весь час' },
];

export const DEFAULT_TIME_PERIOD: TimePeriod = '15min';
export const DEFAULT_DETAIL_LEVEL = 4; // 25% точок (кожна 4-та точка)
export const DEFAULT_REFETCH_INTERVAL = 30000; // 30 секунд

/**
 * Отримує період часу з localStorage або повертає значення за замовчуванням
 */
export const getTimePeriod = (): TimePeriod => {
  if (typeof window === 'undefined') return DEFAULT_TIME_PERIOD;
  
  const stored = localStorage.getItem(STORAGE_KEYS.TIME_PERIOD);
  if (stored && ['15min', '1hour', '3hours', '9hours', 'day', 'all'].includes(stored)) {
    return stored as TimePeriod;
  }
  return DEFAULT_TIME_PERIOD;
};

/**
 * Зберігає період часу в localStorage
 */
export const setTimePeriod = (period: TimePeriod): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIME_PERIOD, period);
};

/**
 * Отримує рівень деталізації з localStorage або повертає значення за замовчуванням
 * (precision: 1 = всі точки, 2 = кожна друга, 4 = кожна четверта = 25%)
 */
export const getDetailLevel = (): number => {
  if (typeof window === 'undefined') return DEFAULT_DETAIL_LEVEL;
  
  const stored = localStorage.getItem(STORAGE_KEYS.DETAIL_LEVEL);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      return parsed;
    }
  }
  return DEFAULT_DETAIL_LEVEL;
};

/**
 * Зберігає рівень деталізації в localStorage
 */
export const setDetailLevel = (level: number): void => {
  if (typeof window === 'undefined') return;
  if (level < 1) level = 1;
  localStorage.setItem(STORAGE_KEYS.DETAIL_LEVEL, level.toString());
};

/**
 * Отримує інтервал рефетчу з localStorage або повертає значення за замовчуванням (мс)
 */
export const getRefetchInterval = (): number => {
  if (typeof window === 'undefined') return DEFAULT_REFETCH_INTERVAL;
  
  const stored = localStorage.getItem(STORAGE_KEYS.REFETCH_INTERVAL);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_REFETCH_INTERVAL;
};

/**
 * Зберігає інтервал рефетчу в localStorage (мс)
 */
export const setRefetchInterval = (interval: number): void => {
  if (typeof window === 'undefined') return;
  if (interval < 1000) interval = 1000; // Мінімум 1 секунда
  localStorage.setItem(STORAGE_KEYS.REFETCH_INTERVAL, interval.toString());
  
  // Відправляємо custom event для синхронізації в межах однієї вкладки
  window.dispatchEvent(new Event('localStorage:refetchInterval'));
};

/**
 * Скидає всі налаштування до значень за замовчуванням
 */
export const resetSettingsToDefaults = (): void => {
  if (typeof window === 'undefined') return;
  setTimePeriod(DEFAULT_TIME_PERIOD);
  setDetailLevel(DEFAULT_DETAIL_LEVEL);
  setRefetchInterval(DEFAULT_REFETCH_INTERVAL);
};

/**
 * Обчислює timestamp для заданого періоду
 */
export const getTimePeriodStart = (period: TimePeriod): Date | null => {
  const now = new Date();
  
  switch (period) {
    case '15min':
      return new Date(now.getTime() - 15 * 60 * 1000);
    case '1hour':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case '3hours':
      return new Date(now.getTime() - 3 * 60 * 60 * 1000);
    case '9hours':
      return new Date(now.getTime() - 9 * 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'all':
      return null; // Всі дані
    default:
      return new Date(now.getTime() - 15 * 60 * 1000);
  }
};


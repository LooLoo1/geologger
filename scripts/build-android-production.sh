#!/bin/bash

# Скрипт для збірки Android APK з продакшн конфігурацією
# Використання: ./scripts/build-android-production.sh <BACKEND_URL>

set -e

# Перевірка аргументів
if [ -z "$1" ]; then
  echo "❌ Помилка: Потрібно вказати URL backend"
  echo "Використання: ./scripts/build-android-production.sh https://your-backend.railway.app"
  exit 1
fi

BACKEND_URL=$1

echo "🚀 Початок збірки Android APK для продакшну"
echo "📡 Backend URL: $BACKEND_URL"

# Перевірка чи існує директорія frontend
if [ ! -d "apps/frontend" ]; then
  echo "❌ Помилка: Директорія apps/frontend не знайдена"
  exit 1
fi

# Створюємо .env.production файл
echo "📝 Створюю .env.production файл..."
cat > apps/frontend/.env.production << EOF
NEXT_PUBLIC_API_URL=$BACKEND_URL
NEXT_PUBLIC_MAP_PROVIDER=leaflet
EOF

echo "✅ .env.production створено"

# Збираємо frontend
echo "🔨 Збираю frontend..."
cd apps/frontend
pnpm build
cd ../..

# Збираємо Android APK
echo "📱 Збираю Android APK..."
pnpm tauri:build:android:apk

echo ""
echo "✅ Збірка завершена!"
echo "📦 APK файл знаходиться в:"
echo "   tauri/src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "💡 Для встановлення на пристрій:"
echo "   adb install -r tauri/src-tauri/gen/android/app/build/outputs/apk/release/app-release.apk"


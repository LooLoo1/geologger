#!/bin/bash

# Скрипт для автоматичної ініціалізації проєкту GeoLogger

set -e

# Колірний вивід
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Перехід до кореневої директорії проєкту
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

info "🚀 Ініціалізація проєкту GeoLogger..."

# Перевірка наявності pnpm
if ! command -v pnpm &> /dev/null; then
    error "pnpm не встановлено"
    error "Встановіть pnpm: npm install -g pnpm"
    exit 1
fi

success "pnpm знайдено"

# Перевірка та створення .env файлу для backend
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
ENV_FILE="$BACKEND_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
    info "📝 Створення .env файлу для backend..."
    cat > "$ENV_FILE" << EOF
# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
PORT=4000
NODE_ENV=dev

# JWT Secret (змініть на випадковий рядок для продакшну!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
EOF
    success ".env файл створено"
else
    info ".env файл вже існує"
fi

# Встановлення залежностей
info "📦 Встановлення залежностей..."
pnpm install
success "Залежності встановлено"

# Генерація Prisma Client
info "🔧 Генерація Prisma Client..."
pnpm --filter backend db:generate
success "Prisma Client згенеровано"

# Застосування міграцій бази даних
info "🗄️  Застосування міграцій бази даних..."
pnpm --filter backend db:migrate
success "Міграції застосовано"

echo ""
success "✨ Проєкт готовий до запуску!"
echo ""
info "Для запуску використовуйте:"
echo "  ${GREEN}pnpm dev${NC}        - Запустити frontend та backend"
echo "  ${GREEN}pnpm dev:tauri${NC}  - Запустити Tauri desktop додаток"
echo "  ${GREEN}pnpm dev:android${NC} - Запустити Android додаток"
echo ""


#!/bin/bash

# Скрипт для запуску Android емулятора та Tauri додатку

# Ініціалізація змінних
EMULATOR_PID=""
BACKEND_PID=""

# Колірний вивід
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функція для виводу повідомлень
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

# Налаштування Android environment
info "Налаштування Android environment..."

export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator

# Додаємо cmdline-tools до PATH (може бути в різних місцях)
if [ -d "$ANDROID_HOME/cmdline-tools/latest/bin" ]; then
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
elif [ -d "$ANDROID_HOME/cmdline-tools/bin" ]; then
    export PATH=$PATH:$ANDROID_HOME/cmdline-tools/bin
fi

# Перевірка наявності Android SDK
if [ ! -d "$ANDROID_HOME" ]; then
    error "Android SDK не знайдено в $ANDROID_HOME"
    error "Будь ласка, встановіть Android Studio та SDK"
    exit 1
fi

# Перевірка наявності adb
if ! command -v adb &> /dev/null; then
    error "adb не знайдено в PATH"
    error "Будь ласка, перевірте встановлення Android SDK"
    exit 1
fi

# Перевірка наявності emulator
if ! command -v emulator &> /dev/null; then
    error "emulator не знайдено в PATH"
    error "Будь ласка, перевірте встановлення Android SDK та емуляторів"
    exit 1
fi

success "Android SDK знайдено: $ANDROID_HOME"

# Функція для перевірки чи запущений емулятор
is_emulator_running() {
    adb devices | grep -q "emulator.*device$"
}

# Функція для отримання списку доступних емуляторів
list_avds() {
    emulator -list-avds 2>/dev/null | head -1
}

# Перевірка чи запущений емулятор
if is_emulator_running; then
    success "Емулятор вже запущений"
    EMULATOR_PID="" # Емулятор не запущений цим скриптом
else
    info "Емулятор не знайдено, запускаю..."
    
    # Перевірка чи вказано конкретний емулятор через змінну оточення
    if [ ! -z "$ANDROID_EMULATOR_AVD" ]; then
        AVD_NAME="$ANDROID_EMULATOR_AVD"
        info "Використовую емулятор зі змінної оточення: $AVD_NAME"
    else
        # Отримуємо перший доступний емулятор
        AVD_NAME=$(list_avds)
    fi
    
    if [ -z "$AVD_NAME" ]; then
        error "Не знайдено доступних емуляторів"
        error "Будь ласка, створіть емулятор через Android Studio:"
        error "  Tools → Device Manager → Create Device"
        error "Або вкажіть емулятор через змінну: ANDROID_EMULATOR_AVD=<назва>"
        exit 1
    fi
    
    success "Знайдено емулятор: $AVD_NAME"
    info "Запускаю емулятор (це може зайняти деякий час)..."
    
    # Запускаємо емулятор у фоні
    emulator -avd "$AVD_NAME" > /dev/null 2>&1 &
    EMULATOR_PID=$!
    
    # Чекаємо поки емулятор завантажиться
    info "Очікую завантаження емулятора..."
    MAX_WAIT=120
    WAIT_TIME=0
    
    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        if is_emulator_running; then
            success "Емулятор готовий!"
            break
        fi
        sleep 2
        WAIT_TIME=$((WAIT_TIME + 2))
        echo -n "."
    done
    echo ""
    
    if ! is_emulator_running; then
        error "Емулятор не завантажився протягом $MAX_WAIT секунд"
        error "PID процесу: $EMULATOR_PID"
        exit 1
    fi
    
    # Додаткова затримка для повної готовності
    info "Очікую повну готовність емулятора..."
    sleep 5
fi

# Перевірка підключення через adb
DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')
success "Знайдено $DEVICE_COUNT пристрій(ів)"

# Перехід до кореневої директорії проекту
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Запуск backend у фоні
info "Запускаю backend..."
pnpm --filter backend dev > /tmp/geologger-backend.log 2>&1 &
BACKEND_PID=$!
success "Backend запущено (PID: $BACKEND_PID)"

# Невелика затримка для запуску backend
sleep 2

# Запуск Tauri Android додатку (він сам запустить frontend)
info "Запускаю Tauri Android додаток..."
info "Це може зайняти деякий час при першому запуску..."

# Функція для очищення при завершенні
cleanup() {
    echo ""
    info "Завершую процеси..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        success "Backend зупинено"
    fi
    # Закриваємо емулятор тільки якщо ми його запустили
    if [ ! -z "$EMULATOR_PID" ]; then
        warning "Емулятор продовжує працювати (PID: $EMULATOR_PID)"
        warning "Щоб зупинити емулятор вручну: adb emu kill"
    fi
    exit 0
}

# Встановлюємо trap для cleanup при Ctrl+C
trap cleanup INT TERM EXIT

# Запускаємо Tauri Android dev (блокуюча команда)
pnpm --filter tauri-app tauri android dev


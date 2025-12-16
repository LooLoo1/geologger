#!/bin/bash

# Script to setup Android environment for Tauri

echo "🔧 Setting up Android environment for Tauri..."

# Set environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator

# Auto-detect NDK
if [ -d "$ANDROID_HOME/ndk" ]; then
  LATEST_NDK=$(ls -1 "$ANDROID_HOME/ndk" | grep -v ".installer" | sort -V | tail -1)
  if [ -n "$LATEST_NDK" ] && [ -f "$ANDROID_HOME/ndk/$LATEST_NDK/source.properties" ]; then
    export NDK_HOME="$ANDROID_HOME/ndk/$LATEST_NDK"
    echo "✅ Found NDK: $NDK_HOME"
  else
    echo "⚠️  NDK not fully installed. Please install NDK through Android Studio:"
    echo "   1. Open Android Studio"
    echo "   2. Tools → SDK Manager"
    echo "   3. SDK Tools tab → check 'Show Package Details'"
    echo "   4. Expand 'NDK (Side by side)' and install version 26.1.10909125 or newer"
    exit 1
  fi
else
  echo "❌ NDK not found. Please install through Android Studio (see instructions above)"
  exit 1
fi

echo "✅ Android environment ready!"
echo "   ANDROID_HOME: $ANDROID_HOME"
echo "   NDK_HOME: $NDK_HOME"

# Try to initialize Tauri Android
cd "$(dirname "$0")/../tauri" || exit 1
echo ""
echo "🚀 Initializing Tauri Android..."
pnpm tauri android init


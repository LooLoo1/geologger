#!/bin/bash

# Script to install and run the Android app on connected device/emulator

APK_PATH="src-tauri/gen/android/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE_NAME="com.geologger.app"
MAIN_ACTIVITY="com.geologger.app.MainActivity"

echo "🔍 Checking for connected devices..."

# Check if device is connected
DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l | tr -d ' ')

if [ "$DEVICES" -eq "0" ]; then
  echo "❌ No devices found. Please:"
  echo "   1. Start an emulator, OR"
  echo "   2. Connect a physical device with USB debugging enabled"
  exit 1
fi

echo "✅ Found $DEVICES device(s)"

# Check if APK exists
if [ ! -f "$APK_PATH" ]; then
  echo "❌ APK not found at $APK_PATH"
  echo "   Please build the app first: pnpm run dev:tauri:android"
  exit 1
fi

echo "📦 Installing APK..."
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
  echo "✅ App installed successfully"
  
  echo "🚀 Launching app..."
  adb shell am start -n "$PACKAGE_NAME/$MAIN_ACTIVITY"
  
  if [ $? -eq 0 ]; then
    echo "✅ App launched successfully"
  else
    echo "⚠️  Failed to launch app, but it's installed"
  fi
else
  echo "❌ Failed to install APK"
  exit 1
fi


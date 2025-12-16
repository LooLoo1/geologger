#!/bin/bash

# Script to add location permissions to AndroidManifest.xml
# This ensures permissions are added even if the file is regenerated

MANIFEST_FILE="src-tauri/gen/android/app/src/main/AndroidManifest.xml"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "⚠️  AndroidManifest.xml not found. Run 'tauri android init' first."
  exit 1
fi

# Check if permissions already exist
if grep -q "ACCESS_FINE_LOCATION" "$MANIFEST_FILE"; then
  echo "✅ Location permissions already exist in AndroidManifest.xml"
  exit 0
fi

# Add location permissions after INTERNET permission
sed -i.bak '/android.permission.INTERNET/a\
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
' "$MANIFEST_FILE"

# Add location features after leanback feature
sed -i.bak '/android.software.leanback/a\
    <uses-feature android:name="android.hardware.location" android:required="false" />\
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />\
    <uses-feature android:name="android.hardware.location.network" android:required="false" />
' "$MANIFEST_FILE"

# Remove backup file
rm -f "${MANIFEST_FILE}.bak"

echo "✅ Location permissions added to AndroidManifest.xml"


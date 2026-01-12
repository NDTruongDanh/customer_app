#!/bin/bash
# Script to convert AAB to APK using bundletool

# Download bundletool if not exists
if [ ! -f "bundletool.jar" ]; then
    echo "Downloading bundletool..."
    curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar
fi

# Check if AAB file is provided
if [ -z "$1" ]; then
    echo "Usage: ./aab-to-apk.sh <path-to-aab-file>"
    exit 1
fi

AAB_FILE=$1
OUTPUT_DIR="apks_output"

# Generate universal APK
echo "Generating universal APK from $AAB_FILE..."
java -jar bundletool.jar build-apks \
    --bundle="$AAB_FILE" \
    --output="$OUTPUT_DIR/app.apks" \
    --mode=universal

# Extract the APK
echo "Extracting APK..."
unzip -o "$OUTPUT_DIR/app.apks" -d "$OUTPUT_DIR"
mv "$OUTPUT_DIR/universal.apk" "$OUTPUT_DIR/app-universal.apk"

echo "✅ Done! APK file: $OUTPUT_DIR/app-universal.apk"
echo "You can now install this APK on your Android device."

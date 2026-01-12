# AAB to APK Conversion Guide

## Quick Answer

You **cannot directly convert** an AAB file to APK. Instead, you have two options:

## Option 1: Build a New APK (Recommended) ✨

Build a new version that outputs APK instead of AAB:

### For Testing:

```bash
eas build --platform android --profile preview-apk
```

### For Production:

```bash
eas build --platform android --profile production-apk
```

**Advantages:**

- Clean, official build
- Optimized for your needs
- No additional tools required

---

## Option 2: Generate APK from AAB using Bundletool

Use Google's bundletool to generate a universal APK from your AAB:

### Windows:

```bash
.\scripts\aab-to-apk.bat path\to\your\app.aab
```

### Linux/Mac:

```bash
chmod +x scripts/aab-to-apk.sh
./scripts/aab-to-apk.sh path/to/your/app.aab
```

### Manual Steps:

```bash
# 1. Download bundletool
curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar

# 2. Generate universal APK
java -jar bundletool.jar build-apks \
  --bundle=your-app.aab \
  --output=app.apks \
  --mode=universal

# 3. Extract the APK
unzip app.apks
# You'll get universal.apk which can be installed on devices
```

**Advantages:**

- Use existing AAB file
- Quick for one-time testing

**Disadvantages:**

- Larger file size (contains all resources)
- Requires Java and bundletool
- Not optimized for specific devices

---

## When to Use Each Format

### AAB (Android App Bundle)

- ✅ Submitting to Google Play Store
- ✅ Smaller download size for users
- ✅ Automatic optimization per device
- ❌ Cannot install directly on devices

### APK (Android Package)

- ✅ Direct installation on devices
- ✅ Internal testing/distribution
- ✅ Distribution outside Play Store
- ❌ Larger file size
- ❌ Not optimized per device

---

## Recommended Workflow

1. **For Play Store**: Use AAB

   ```bash
   eas build --platform android --profile production
   eas submit --platform android
   ```

2. **For Testing**: Use APK

   ```bash
   eas build --platform android --profile preview-apk
   ```

3. **For Both**: Build separately

   ```bash
   # Build AAB for Play Store
   eas build --platform android --profile production

   # Build APK for direct distribution
   eas build --platform android --profile production-apk
   ```

---

## Installation

### Installing APK on Android Device:

1. **Enable Unknown Sources:**

   - Go to Settings > Security
   - Enable "Install from Unknown Sources" or "Install Unknown Apps"

2. **Transfer APK to device:**

   - Via USB cable
   - Via cloud storage (Google Drive, Dropbox)
   - Via direct download link

3. **Install:**
   - Tap the APK file
   - Follow installation prompts

### Installing via ADB:

```bash
adb install path/to/your-app.apk
```

---

## Troubleshooting

### "Java not found" error:

Install Java JDK 8 or higher:

- Windows: https://adoptium.net/
- Mac: `brew install openjdk`
- Linux: `sudo apt install default-jdk`

### "bundletool not found" error:

The scripts will auto-download bundletool, but you can manually download from:
https://github.com/google/bundletool/releases

### APK won't install:

- Check if you have the same app already installed (uninstall first)
- Verify "Unknown Sources" is enabled
- Ensure APK is not corrupted (re-download)

---

## File Locations

After conversion, files will be in:

```
apks_output/
├── app.apks (archive containing APKs)
└── app-universal.apk (installable APK)
```

The `app-universal.apk` is the file you want to install on devices.

---
description: How to deploy the Room Master mobile app
---

# Room Master App Deployment Guide

This guide covers multiple deployment options for the Room Master Expo React Native app.

## Prerequisites

Before deploying, ensure you have:

- An Expo account (create one at https://expo.dev)
- EAS CLI installed globally: `npm install -g eas-cli`
- Logged into EAS: `eas login`

## Deployment Options

### Option 1: Expo Go (Development/Testing Only)

**Use case:** Quick testing with team members using Expo Go app

1. Start the development server:

```bash
npx expo start
```

2. Share the QR code or development URL with testers who have Expo Go installed on their devices.

**Limitations:**

- Requires Expo Go app
- Cannot use custom native modules
- Not suitable for production

---

### Option 2: EAS Build (Recommended for Production)

**Use case:** Production-ready builds for App Store and Google Play

#### Initial Setup

1. Install EAS CLI globally (if not already installed):

```bash
npm install -g eas-cli
```

2. Login to your Expo account:

```bash
eas login
```

3. Configure your project for EAS Build:

```bash
eas build:configure
```

This creates an `eas.json` file with build configurations.

#### Update app.json for Production

Add the following to your `app.json`:

```json
{
  "expo": {
    "name": "Room Master",
    "slug": "customer_app",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.roommaster",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.roommaster",
      "versionCode": 1
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

#### Build for Android

1. Create a development build (for testing):

```bash
eas build --platform android --profile development
```

2. Create a preview build (internal testing):

```bash
eas build --platform android --profile preview
```

3. Create a production build (for Google Play):

```bash
eas build --platform android --profile production
```

4. Download the APK/AAB from the EAS dashboard or use:

```bash
eas build:download --platform android
```

#### Build for iOS

**Note:** Building for iOS requires an Apple Developer account ($99/year)

1. Create a development build:

```bash
eas build --platform ios --profile development
```

2. Create a preview build:

```bash
eas build --platform ios --profile preview
```

3. Create a production build (for App Store):

```bash
eas build --platform ios --profile production
```

#### Build for Both Platforms

```bash
eas build --platform all --profile production
```

#### Building APK Files (For Direct Installation)

By default, production builds create AAB (Android App Bundle) files for Google Play. To create APK files for direct installation on devices:

**For Testing/Internal Distribution:**

```bash
eas build --platform android --profile preview-apk
```

**For Production APK:**

```bash
eas build --platform android --profile production-apk
```

**Note:** APK files are larger than AAB but can be installed directly on devices without going through Google Play.

#### Converting AAB to APK

If you already have an AAB file and need an APK for testing:

**Method 1: Using the provided script (Windows)**

```bash
.\scripts\aab-to-apk.bat path\to\your\app.aab
```

**Method 2: Using the provided script (Linux/Mac)**

```bash
chmod +x scripts/aab-to-apk.sh
./scripts/aab-to-apk.sh path/to/your/app.aab
```

**Method 3: Manual conversion with bundletool**

```bash
# Download bundletool
curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar

# Generate universal APK
java -jar bundletool.jar build-apks --bundle=app.aab --output=app.apks --mode=universal

# Extract the APK
unzip app.apks
# The universal.apk file can now be installed on devices
```

**Important Notes:**

- AAB files cannot be directly "converted" - bundletool generates APKs from the bundle
- Universal APKs are larger as they contain resources for all device configurations
- For production, use AAB for Play Store and APK for direct distribution/testing

---

### Option 3: EAS Update (Over-the-Air Updates)

**Use case:** Push JavaScript/asset updates without rebuilding the app

1. Configure EAS Update:

```bash
eas update:configure
```

2. Publish an update:

```bash
eas update --branch production --message "Bug fixes and improvements"
```

3. For different environments:

```bash
# Development
eas update --branch development --message "Development update"

# Staging
eas update --branch staging --message "Staging update"

# Production
eas update --branch production --message "Production update"
```

**Note:** OTA updates only work for JavaScript and assets. Native code changes require a new build.

---

### Option 4: EAS Submit (App Store Submission)

**Use case:** Submit builds to App Store and Google Play

#### Submit to Google Play

1. First, create a production build (if not already done):

```bash
eas build --platform android --profile production
```

2. Submit to Google Play:

```bash
eas submit --platform android
```

Follow the prompts to provide:

- Google Service Account JSON key
- Track (internal/alpha/beta/production)

#### Submit to App Store

1. First, create a production build (if not already done):

```bash
eas build --platform ios --profile production
```

2. Submit to App Store:

```bash
eas submit --platform ios
```

Follow the prompts to provide:

- Apple ID
- App-specific password
- ASC App ID

---

### Option 5: Local Development Build

**Use case:** Build locally without EAS (requires native development environment)

#### Android Local Build

1. Ensure Android Studio and SDK are installed
2. Generate native Android project:

```bash
npx expo prebuild --platform android
```

3. Build using Gradle:

```bash
cd android
./gradlew assembleRelease
```

4. APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

#### iOS Local Build

1. Ensure Xcode is installed (macOS only)
2. Generate native iOS project:

```bash
npx expo prebuild --platform ios
```

3. Open in Xcode:

```bash
open ios/customer_app.xcworkspace
```

4. Build and archive from Xcode

---

## Environment Configuration

### Production Environment Variables

Update your `.env` file or use EAS Secrets:

```bash
# Set environment secrets for EAS
eas secret:create --scope project --name API_URL --value "https://room-master-dcdsfng4c7h7hwbg.eastasia-01.azurewebsites.net/v1"
```

### Update app.json for Different Environments

Consider using `app.config.js` instead of `app.json` for dynamic configuration:

```javascript
// app.config.js
export default {
  expo: {
    name:
      process.env.APP_ENV === "production" ? "Room Master" : "Room Master Dev",
    slug: "customer_app",
    // ... rest of config
  },
};
```

---

## Recommended Deployment Workflow

### For Development/Testing:

1. Use `npx expo start` for local development
2. Use EAS Build with `--profile development` for testing on physical devices
3. Use EAS Update for quick iterations

### For Production:

1. Create production builds with EAS Build
2. Test thoroughly using preview builds
3. Submit to stores using EAS Submit
4. Use EAS Update for hotfixes and minor updates

---

## Common Commands Reference

```bash
# Development
npx expo start                              # Start dev server
npx expo start --android                    # Start with Android
npx expo start --ios                        # Start with iOS

# EAS Build
eas build --platform android --profile production
eas build --platform ios --profile production
eas build --platform all --profile production

# EAS Update
eas update --branch production --message "Update message"

# EAS Submit
eas submit --platform android
eas submit --platform ios

# Check build status
eas build:list

# Download builds
eas build:download --platform android
```

---

## Troubleshooting

### Build Fails

- Check `eas build:list` for error logs
- Ensure all dependencies are compatible with Expo SDK version
- Verify native module configurations

### Update Not Appearing

- Ensure app is using the correct update branch
- Check update compatibility with build version
- Force close and reopen the app

### Submission Fails

- Verify app credentials are correct
- Check app.json configuration (bundle ID, package name)
- Ensure build is for the correct platform and profile

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)

@echo off
REM Script to convert AAB to APK using bundletool (Windows)

REM Download bundletool if not exists
if not exist "bundletool.jar" (
    echo Downloading bundletool...
    curl -L -o bundletool.jar https://github.com/google/bundletool/releases/latest/download/bundletool-all.jar
)

REM Check if AAB file is provided
if "%~1"=="" (
    echo Usage: aab-to-apk.bat ^<path-to-aab-file^>
    exit /b 1
)

set AAB_FILE=%~1
set OUTPUT_DIR=apks_output

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Generate universal APK
echo Generating universal APK from %AAB_FILE%...
java -jar bundletool.jar build-apks --bundle="%AAB_FILE%" --output="%OUTPUT_DIR%\app.apks" --mode=universal

REM Extract the APK
echo Extracting APK...
tar -xf "%OUTPUT_DIR%\app.apks" -C "%OUTPUT_DIR%"
move "%OUTPUT_DIR%\universal.apk" "%OUTPUT_DIR%\app-universal.apk"

echo.
echo ✅ Done! APK file: %OUTPUT_DIR%\app-universal.apk
echo You can now install this APK on your Android device.

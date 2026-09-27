@echo off
echo Copying Android emulator Downloads to:
echo "%USERPROFILE%\Downloads"
echo.

adb pull "/sdcard/Download" "%USERPROFILE%\Downloads"

if errorlevel 1 (
    echo.
    echo ERROR: Copy failed. Make sure the emulator is running and ADB is available.
    pause
    exit /b 1
)

echo.
echo Copy completed successfully.
pause
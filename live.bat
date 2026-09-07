@echo off
echo Starting...
call npx expo run:android --variant release
echo.
echo Exit code: %ERRORLEVEL%
echo.
cmd /k
pause
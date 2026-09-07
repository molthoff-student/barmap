@echo off
echo Starting...
call npx expo start
echo.
echo Exit code: %ERRORLEVEL%
echo.
cmd /k
pause
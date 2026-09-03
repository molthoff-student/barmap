@echo off
echo Starting...
cd /d "C:\Users\mick_\Lokale bestanden\School\2026\VSCode\websites\BarMap" 
call npx expo start
echo.
echo Exit code: %ERRORLEVEL%
echo.
cmd /k
pause
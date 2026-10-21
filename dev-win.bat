@echo off
title ErTerm (Development Mode)
echo ========================================================
echo       ErTerm — Windows Development Launcher        
echo ========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Compiling TypeScript source (src -> dist-electron)...
call npx tsc

echo [1/2] Starting backend terminal server on port 3980...
start "ErTerm Server" /b node dist-electron/server.js

timeout /t 2 /nobreak >nul

echo [2/2] Opening application window...
if exist "node_modules\electron" (
    start "" npx electron dist-electron/main.js
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://127.0.0.1:3980 --window-size=1240,820
) else if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:3980 --window-size=1240,820
) else (
    start http://127.0.0.1:3980
)

echo.
echo ErTerm dev server is running at http://127.0.0.1:3980

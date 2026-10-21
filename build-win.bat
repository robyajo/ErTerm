@echo off
title ErTerm Package Builder (Windows)
echo ========================================================
echo             ErTerm — Windows App Builder                
echo ========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

echo [1/2] Checking build tools and dependencies...
if not exist "node_modules\electron-builder" (
    echo Installing electron and electron-builder...
    call npm install -D electron electron-builder
)

taskkill /F /IM "ErTerm.exe" >nul 2>nul
taskkill /F /IM "electron.exe" >nul 2>nul

echo [2/2] Packaging with Vite and Electron Forge...
call npm run package

echo.
echo ========================================================
echo  BUILD SUCCESS!
echo  Package created in .vite/build
echo ========================================================
pause

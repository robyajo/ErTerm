@echo off
title ErTerm Package Builder (Electron Forge)
echo ========================================================
echo         ErTerm — Desktop App Package Builder            
echo ========================================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)

:: Close instances
taskkill /F /IM "ErTerm.exe" >nul 2>nul
taskkill /F /IM "electron.exe" >nul 2>nul

echo Packaging ErTerm with Vite and Electron Forge...
call npm run package
echo.
echo ========================================================
echo  BUILD SUCCESS!
echo  Package created in .vite/build and out/
echo ========================================================
pause

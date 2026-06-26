@echo off
REM ============================================================
REM  PID Master launcher (Windows)
REM  Double-click to start the app. Installs dependencies on
REM  the first run, then opens http://localhost:5173.
REM ============================================================
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found on your PATH.
  echo Install it from https://nodejs.org/ and try again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies, this only happens once...
  call npm install
  if errorlevel 1 (
    echo.
    echo Dependency install failed. See the messages above.
    pause
    exit /b 1
  )
)

echo Starting PID Master...
call npm run dev
pause

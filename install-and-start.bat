@echo off
echo ========================================
echo Bharat Sahayak - First Time Setup
echo ========================================
echo.

echo [1/4] Installing Mock Backend Dependencies...
cd mock-backend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Installing Frontend Dependencies...
cd frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Starting Mock Backend...
start "Bharat Sahayak Backend" cmd /k "cd mock-backend && npm start"
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting Frontend...
start "Bharat Sahayak Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

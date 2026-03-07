@echo off
echo ========================================
echo Bharat Sahayak - Development Startup
echo ========================================
echo.

echo [1/3] Starting Mock Backend Server...
echo.
start "Bharat Sahayak Backend" cmd /k "cd mock-backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo [2/3] Starting Frontend (Vite Dev Server)...
echo.
start "Bharat Sahayak Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Setup Complete!
echo.
echo ========================================
echo Application URLs:
echo ========================================
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo ========================================
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:5173

echo.
echo Development servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

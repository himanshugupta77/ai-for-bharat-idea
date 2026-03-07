@echo off
REM Script to run custom hooks unit tests on Windows
REM Usage: test-hooks.bat [options]
REM Options:
REM   --install    Install test dependencies first
REM   --coverage   Run with coverage report
REM   --ui         Run with Vitest UI
REM   --run        Run tests once

setlocal enabledelayedexpansion

cd /d "%~dp0"

set INSTALL=false
set COVERAGE=false
set UI=false
set WATCH=true

:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--install" set INSTALL=true
if "%~1"=="--coverage" (
    set COVERAGE=true
    set WATCH=false
)
if "%~1"=="--ui" (
    set UI=true
    set WATCH=false
)
if "%~1"=="--run" set WATCH=false
shift
goto parse_args
:end_parse

if "%INSTALL%"=="true" (
    echo 📦 Installing test dependencies...
    call npm install
    echo ✅ Dependencies installed
    echo.
)

echo 🧪 Running custom hooks unit tests...
echo.

if "%COVERAGE%"=="true" (
    echo 📊 Running with coverage report...
    call npm run test:coverage -- src/hooks/__tests__
) else if "%UI%"=="true" (
    echo 🎨 Opening Vitest UI...
    call npm run test:ui -- src/hooks/__tests__
) else if "%WATCH%"=="false" (
    echo ▶️  Running tests once...
    call npm run test:run -- src/hooks/__tests__
) else (
    echo 👀 Running in watch mode...
    call npm test -- src/hooks/__tests__
)

endlocal

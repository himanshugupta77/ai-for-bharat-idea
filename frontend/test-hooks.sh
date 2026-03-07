#!/bin/bash

# Script to run custom hooks unit tests
# Usage: ./test-hooks.sh [options]
# Options:
#   --install    Install test dependencies first
#   --coverage   Run with coverage report
#   --ui         Run with Vitest UI
#   --watch      Run in watch mode (default)

set -e

cd "$(dirname "$0")"

# Parse arguments
INSTALL=false
COVERAGE=false
UI=false
WATCH=true

for arg in "$@"; do
  case $arg in
    --install)
      INSTALL=true
      ;;
    --coverage)
      COVERAGE=true
      WATCH=false
      ;;
    --ui)
      UI=true
      WATCH=false
      ;;
    --run)
      WATCH=false
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./test-hooks.sh [--install] [--coverage] [--ui] [--run]"
      exit 1
      ;;
  esac
done

# Install dependencies if requested
if [ "$INSTALL" = true ]; then
  echo "📦 Installing test dependencies..."
  npm install
  echo "✅ Dependencies installed"
  echo ""
fi

# Run tests
echo "🧪 Running custom hooks unit tests..."
echo ""

if [ "$COVERAGE" = true ]; then
  echo "📊 Running with coverage report..."
  npm run test:coverage -- src/hooks/__tests__
elif [ "$UI" = true ]; then
  echo "🎨 Opening Vitest UI..."
  npm run test:ui -- src/hooks/__tests__
elif [ "$WATCH" = false ]; then
  echo "▶️  Running tests once..."
  npm run test:run -- src/hooks/__tests__
else
  echo "👀 Running in watch mode..."
  npm test -- src/hooks/__tests__
fi

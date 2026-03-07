#!/bin/bash

echo "========================================"
echo "Bharat Sahayak - Development Startup"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "[ERROR] AWS SAM CLI is not installed!"
    echo "Install it from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Install it from: https://nodejs.org/"
    exit 1
fi

echo "[1/3] Starting Backend (SAM Local API)..."
echo ""

# Start backend in background
cd infrastructure
sam local start-api --port 3000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Waiting for backend to start..."
sleep 10

echo ""
echo "[2/3] Starting Frontend (Vite Dev Server)..."
echo ""

# Start frontend in background
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Frontend PID: $FRONTEND_PID"
echo "Waiting for frontend to start..."
sleep 5

echo ""
echo "[3/3] Setup Complete!"
echo ""
echo "========================================"
echo "Application URLs:"
echo "========================================"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:3000"
echo "========================================"
echo ""
echo "Logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "To stop the servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers and exit..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

# Wait for user to press Ctrl+C
wait

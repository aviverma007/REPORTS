#!/bin/bash
echo "Starting SmartWorld Analytics..."

# Start backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
echo "✅ Backend started at http://localhost:8001 (PID: $BACKEND_PID)"

cd ../frontend
npm start &
FRONTEND_PID=$!
echo "✅ Frontend starting at http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "Open http://localhost:3000 in your browser"
echo "Press Ctrl+C to stop both servers"

wait

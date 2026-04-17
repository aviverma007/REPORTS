@echo off
echo ================================================
echo   SmartWorld Developers - Analytics Portal
echo ================================================
echo.

echo [1/2] Starting Backend (FastAPI)...
start "SmartWorld Backend" cmd /k "cd backend && pip install fastapi uvicorn python-dotenv openpyxl pandas python-multipart starlette && python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 4 /nobreak > nul

echo [2/2] Starting Frontend (React)...
start "SmartWorld Frontend" cmd /k "cd frontend && npm install --legacy-peer-deps --no-audit --no-fund && npm start"

echo.
echo ================================================
echo   Backend:  http://localhost:8001
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8001/docs
echo ================================================
echo.
echo Both windows opened. Wait 2-3 mins for React to compile.
echo Then open: http://localhost:3000
pause

@echo off
echo Starting SmartWorld Analytics...

start "Backend" cmd /k "cd backend && pip install fastapi uvicorn python-dotenv openpyxl pandas python-multipart starlette && uvicorn server:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 3 /nobreak > nul

start "Frontend" cmd /k "cd frontend && npm install --legacy-peer-deps && npm start"

echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:3000
echo.
pause

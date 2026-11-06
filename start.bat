@echo off
echo ===================================================
echo Starting PayAgent: Autonomous Agentic Commerce Engine
echo Built for PayPal AI Hackathon 2026
echo ===================================================

start "PayAgent Backend" cmd /k "cd backend && python app.py"
timeout /t 2 >nul
start "PayAgent Frontend" cmd /k "cd frontend && npm run dev"

echo Both services launched!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
pause

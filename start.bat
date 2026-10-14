@echo off
title CS2 Tactical HQ - Launcher
echo ========================================================
echo        CS2 TACTICAL HQ - DEMARRAGE LOCAL
echo ========================================================
echo.
echo Demarrage du Backend FastAPI (Port 8000)...
start "CS2 HQ - Backend" cmd /k "cd /d %~dp0backend && .\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"

timeout /t 2 /nobreak > nul

echo Demarrage du Frontend Vite (Port 5173)...
start "CS2 HQ - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Application lancee !
echo Interface Web : http://127.0.0.1:5173
echo API Swagger   : http://127.0.0.1:8000/docs
echo ========================================================
pause

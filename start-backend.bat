@echo off
echo ========================================================
echo       WRISTOS — BACKEND SERVER (FastAPI + Uvicorn)
echo ========================================================
cd backend
where python >nul 2>nul
if %errorlevel% equ 0 (
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    "%LOCALAPPDATA%\Programs\Python\Python315\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
)
pause

@echo off
setlocal EnableDelayedExpansion

:: ============================================================
::  Baghewala Digital Twin — One-Click Launcher
::  Starts backend (FastAPI/Uvicorn) + frontend (Vite/React)
::  Press any key in this window to stop both servers cleanly.
:: ============================================================

title Baghewala Digital Twin Launcher

:: Colour codes  (0A = bright green on black)
color 0A

echo.
echo  =====================================================
echo   BAGHEWALA DIGITAL TWIN  ^|  Smart India Hackathon
echo  =====================================================
echo.

:: ── 1. Verify Python is available ────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Python not found on PATH.
    echo         Install Python 3.8+ from https://python.org and try again.
    echo.
    pause
    exit /b 1
)

:: ── 2. Verify Node.js / npm is available ─────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Node.js not found on PATH.
    echo         Install Node.js 18+ from https://nodejs.org and try again.
    echo.
    pause
    exit /b 1
)

:: ── 3. Start Backend ──────────────────────────────────────────────────────────
echo  [1/3] Starting FastAPI backend...
echo.

:: Activate venv if it exists, otherwise use system Python
if exist "backend\venv\Scripts\activate.bat" (
    echo        Virtual environment found — activating.
    start "Baghewala Backend" cmd /k ^
        "cd /d %~dp0backend && call venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000 && echo. && echo Backend stopped."
) else (
    echo        No venv found — using system Python.
    echo        Tip: create one with  python -m venv backend\venv
    echo.
    start "Baghewala Backend" cmd /k ^
        "cd /d %~dp0backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 && echo. && echo Backend stopped."
)

:: ── 4. Give the backend a moment to bind before the frontend starts ───────────
echo  [2/3] Waiting 6 seconds for backend to initialise...
timeout /t 6 /nobreak >nul

:: ── 5. Install frontend deps if node_modules is missing ──────────────────────
if not exist "frontend\node_modules\" (
    echo.
    echo  [2/3] node_modules not found — running npm install first...
    echo        This only happens once.  Please wait.
    cd /d %~dp0frontend
    npm install
    cd /d %~dp0
    echo.
)

:: ── 6. Start Frontend ─────────────────────────────────────────────────────────
echo  [3/3] Starting Vite dev server...
echo.
start "Baghewala Frontend" cmd /k ^
    "cd /d %~dp0frontend && npm run dev && echo. && echo Frontend stopped."

:: ── 7. Wait a moment, then print the access URLs ─────────────────────────────
timeout /t 3 /nobreak >nul

echo.
echo  =====================================================
echo   SERVERS RUNNING
echo  =====================================================
echo.
echo   Application   ^|  http://localhost:5173
echo   Backend API   ^|  http://localhost:8000
echo   API Docs      ^|  http://localhost:8000/docs
echo   WebSocket     ^|  ws://localhost:8000/ws/digital-twin
echo.
echo  ─────────────────────────────────────────────────────
echo   DEMO CREDENTIALS
echo  ─────────────────────────────────────────────────────
echo   Supervisor :  supervisor@oil.com  /  supervisor123
echo   Incharge   :  incharge14@oil.com  /  incharge123
echo  ─────────────────────────────────────────────────────
echo.
echo   Press any key here to STOP both servers...
echo.
pause >nul

:: ── 8. Graceful shutdown ──────────────────────────────────────────────────────
echo.
echo  Stopping servers...

:: Kill by window title so we don't nuke unrelated Python/Node processes
taskkill /FI "WINDOWTITLE eq Baghewala Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Baghewala Frontend" /F >nul 2>&1

:: Fallback: kill uvicorn and the vite node process if still running
taskkill /F /IM uvicorn.exe >nul 2>&1

echo  Done. Both servers stopped.
echo.
color 07
endlocal

@echo off
echo Starting Baghewala Digital Twin...
echo.

echo Starting Backend...
cd backend
start cmd /k "python main.py"
cd ..

echo Waiting for backend to start...
timeout /t 5 /nobreak

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo Servers stopped.

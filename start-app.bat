@echo off
echo ==========================================
echo Library Management System Startup
echo ==========================================
echo.

echo Starting backend server on port 5000...
start "Backend Server" cmd /k "node server.js"

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Starting React client on port 3000...
start "React Client" cmd /k "cd client && npm start"

echo.
echo ==========================================
echo Both applications are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ==========================================
echo.
echo The applications should open automatically in your browser.
echo If not, please manually navigate to the URLs above.
echo.
echo Press any key to close this window...
pause > nul

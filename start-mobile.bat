@echo off
echo Starting Library Mobile App...
echo.
echo Make sure you have:
echo 1. Node.js installed
echo 2. Expo CLI installed (npm install -g @expo/cli)
echo 3. Expo Go app on your mobile device
echo 4. Backend server running on port 5000
echo.
echo Installing dependencies...
cd mobile
npm install
echo.
echo Starting Expo development server...
echo.
echo Scan the QR code with Expo Go app on your mobile device
echo.
npm start
pause

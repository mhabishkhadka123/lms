Write-Host "Starting Library Mobile App..." -ForegroundColor Green
Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. Node.js installed" -ForegroundColor White
Write-Host "2. Expo CLI installed (npm install -g @expo/cli)" -ForegroundColor White
Write-Host "3. Expo Go app on your mobile device" -ForegroundColor White
Write-Host "4. Backend server running on port 5000" -ForegroundColor White
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Cyan
Set-Location mobile
npm install

Write-Host ""
Write-Host "Starting Expo development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Scan the QR code with Expo Go app on your mobile device" -ForegroundColor Green
Write-Host ""

npm start

Read-Host "Press Enter to exit"

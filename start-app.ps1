# Library Management System Startup Script
Write-Host "Starting Library Management System..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install server dependencies if needed
Write-Host "Checking server dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

# Install client dependencies if needed
Write-Host "Checking client dependencies..." -ForegroundColor Yellow
if (!(Test-Path "client/node_modules")) {
    Write-Host "Installing client dependencies..." -ForegroundColor Yellow
    Set-Location "client"
    npm install
    Set-Location ".."
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Kill any existing processes on ports 5000 and 3000
Write-Host "Checking for existing processes..." -ForegroundColor Yellow
if (Test-Port 5000) {
    Write-Host "Killing existing process on port 5000..." -ForegroundColor Yellow
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

if (Test-Port 3000) {
    Write-Host "Killing existing process on port 3000..." -ForegroundColor Yellow
    Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Start backend server
Write-Host "Starting backend server on port 5000..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Minimized -PassThru | Out-Null

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
$serverReady = $false
$attempts = 0
while (-not $serverReady -and $attempts -lt 30) {
    Start-Sleep -Seconds 1
    $attempts++
    if (Test-Port 5000) {
        $serverReady = $true
        Write-Host "Server is running on port 5000" -ForegroundColor Green
    }
}

if (-not $serverReady) {
    Write-Host "Error: Server failed to start on port 5000" -ForegroundColor Red
    exit 1
}

# Test server connection
Write-Host "Testing server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/test" -Method Get -TimeoutSec 5
    Write-Host "Server test successful: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Warning: Server test failed, but continuing..." -ForegroundColor Yellow
}

# Start React client
Write-Host "Starting React client on port 3000..." -ForegroundColor Green
Set-Location "client"
Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Minimized -PassThru | Out-Null
Set-Location ".."

# Wait for client to start
Write-Host "Waiting for client to start..." -ForegroundColor Yellow
$clientReady = $false
$attempts = 0
while (-not $clientReady -and $attempts -lt 60) {
    Start-Sleep -Seconds 1
    $attempts++
    if (Test-Port 3000) {
        $clientReady = $true
        Write-Host "Client is running on port 3000" -ForegroundColor Green
    }
}

if (-not $clientReady) {
    Write-Host "Warning: Client may not have started properly" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Library Management System is starting..." -ForegroundColor Green
Write-Host "Backend Server: http://localhost:5000" -ForegroundColor White
Write-Host "React Client: http://localhost:3000" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both applications should open in your browser automatically." -ForegroundColor Yellow
Write-Host "If not, please manually navigate to the URLs above." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Red
Write-Host ""

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 10
        if (-not (Test-Port 5000)) {
            Write-Host "Warning: Backend server is no longer running" -ForegroundColor Yellow
        }
        if (-not (Test-Port 3000)) {
            Write-Host "Warning: React client is no longer running" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Shutting down..." -ForegroundColor Red
}

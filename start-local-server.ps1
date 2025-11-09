Write-Host "========================================" -ForegroundColor Green
Write-Host "  Ethical Hacker - Local Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Starting local HTTP server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Your game will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Try Python first, then Node.js
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 -m http.server 8000
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Python not found. Using Node.js..." -ForegroundColor Yellow
    npx --yes serve -p 8000
} else {
    Write-Host "ERROR: Neither Python nor Node.js found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  1. Python: https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host "  2. Node.js: https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    pause
}


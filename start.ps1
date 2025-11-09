# Ethical Hacker Game - Start Script
Write-Host "Starting Ethical Hacker Game..." -ForegroundColor Green
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlPath = Join-Path $scriptPath "index.html"

if (Test-Path $htmlPath) {
    Start-Process $htmlPath
    Write-Host "Game opened in your default browser!" -ForegroundColor Green
} else {
    Write-Host "Error: index.html not found!" -ForegroundColor Red
    Write-Host "Current directory: $scriptPath" -ForegroundColor Yellow
}


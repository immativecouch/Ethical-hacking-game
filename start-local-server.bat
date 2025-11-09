@echo off
echo ========================================
echo   Ethical Hacker - Local Server
echo ========================================
echo.
echo Starting local HTTP server...
echo.
echo Your game will be available at:
echo   http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m http.server 8000

pause


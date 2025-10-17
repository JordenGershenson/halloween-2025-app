@echo off
echo ========================================
echo   Pirate's Treasure Hunt Server
echo ========================================
echo.
echo Starting local web server...
echo.
echo Your app will be available at:
echo   http://localhost:8000
echo.
echo Share this URL with guests on your network:

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
echo   http://%IP:~1%:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m http.server 8000

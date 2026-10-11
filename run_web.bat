@echo off
cd /d "%~dp0EyeTic"
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Please set up .venv first.
    pause
    exit /b 1
)
echo =======================================================
echo Starting EyeTic Web Server at http://localhost:5000
echo Open http://localhost:5000 in your browser!
echo Press Ctrl+C to stop.
echo =======================================================
.venv\Scripts\python.exe web_app.py
pause

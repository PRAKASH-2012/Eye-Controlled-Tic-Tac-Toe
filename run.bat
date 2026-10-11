@echo off
cd /d "%~dp0EyeTic"
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Please set up .venv first.
    pause
    exit /b 1
)
.venv\Scripts\python.exe main.py

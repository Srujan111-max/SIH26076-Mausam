@echo off
set "ROOT=%~dp0"
set "FRONTEND=%ROOT%mausam-persona-builder-main\mausam-persona-builder-main"

echo Starting Mausam Flask backend...
start "Mausam Backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%'; .\venv\Scripts\Activate.ps1; python app.py"

echo Starting Mausam React frontend...
start "Mausam Frontend" powershell -NoExit -Command "Set-Location -LiteralPath '%FRONTEND%'; npm run dev"

timeout /t 4 /nobreak >nul
start "" "http://localhost:8080/"
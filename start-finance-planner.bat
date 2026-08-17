@echo off
title Finance Planner Launcher

echo ========================================
echo        Finance Planner starten
echo ========================================
echo.

echo Backend wird gestartet...
start "Finance Planner - Backend" /D "%~dp0backend" cmd /k "mvn spring-boot:run -Dspring-boot.run.workingDirectory=.."

echo Frontend wird gestartet...
start "Finance Planner - Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

exit
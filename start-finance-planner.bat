@echo off

set "FINANCE_PLANNER_JONAS_PASSWORD=150324"
set "FINANCE_PLANNER_ANNINA_PASSWORD=150324"

echo ========================================
echo        Finance Planner starten
echo ========================================
echo.

echo Backend wird gestartet...
start "Finance Planner - Backend" cmd /k "cd /d "%~dp0" && mvn -f backend\pom.xml spring-boot:run"

echo Frontend wird gestartet...
start "Finance Planner - Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

exit
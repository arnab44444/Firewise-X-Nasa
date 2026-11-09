@echo off
title FIREWISE-X: AI-Powered Microgravity Fire Intelligence
echo =====================================================================
echo                FIREWISE-X: FLAME IN FREEFALL
echo   AI-Powered Microgravity Fire Intelligence and Astronaut Safety
echo              Built on NASA PSI-25 (BASS-II) Dataset
echo =====================================================================
echo.
echo Launching FIREWISE-X Platform on http://127.0.0.1:8000 ...
echo.
cd /d "%~dp0"
python backend\server.py
pause

@echo off
setlocal

cd /d "%~dp0"

echo Starting UI branch comparison from:
echo %CD%
echo.

npm.cmd run ui-compare

echo.
echo Script exited with code %ERRORLEVEL%.
echo Press any key to close this window.
pause >nul

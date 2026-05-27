@echo off
cd /d "%~dp0.."
node --env-file=.env.local scripts\open-project-dashboards.mjs %*
exit /b %errorlevel%
